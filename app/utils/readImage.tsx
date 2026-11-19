import { generateText, Output } from 'ai';
import { createGoogle } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogle({
  apiKey:
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const nutritionalInfo = z.object({
  quantity: z.nullable(z.number()),
  energy: z.nullable(z.number()),
  carbs: z.nullable(z.number()),
  sugar: z.nullable(z.number()),
  fats: z.nullable(z.number()),
  protein: z.nullable(z.number()),
  salt: z.nullable(z.number()),
});

export type ReadImageData = z.infer<typeof nutritionalInfo>;

async function optimizeImageBase64(
  base64Img: string
): Promise<{ data: string; mediaType: string }> {
  try {
    const sharp = (await import('sharp')).default;
    const base64Data = base64Img.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const optimized = await sharp(buffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .grayscale()
      .jpeg({ quality: 80 })
      .toBuffer();
    return {
      data: `data:image/jpeg;base64,${optimized.toString('base64')}`,
      mediaType: 'image/jpeg',
    };
  } catch {
    return {
      data: base64Img,
      mediaType: 'image/*',
    };
  }
}

export async function readImage(
  base64Img: string
): Promise<ReadImageData | null> {
  // TODO add more sense checks (proper base64, etc)
  if (!base64Img) {
    return null;
  }
  try {
    const { data: optimizedImg, mediaType } =
      await optimizeImageBase64(base64Img);

    const { output } = await generateText({
      model: google(process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'),
      output: Output.object({
        schema: nutritionalInfo,
        name: 'nutritional_info',
        description: 'Nutritional information extracted from the food label',
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'This image contains a nutritional info label. It can be in any language, but probably is in spanish or english. The information might be duplicated in columns referencing different serving sizes: in that case, always use the data in the first column. I need you to return the values per portion with key-value pairs where the value always represents grams except for the calories where it represents kcal. If you cannot identify some or all the values, use null. ',
            },
            {
              type: 'file',
              data: optimizedImg,
              mediaType,
            },
          ],
        },
      ],
    });

    console.debug(
      '--->  |  readImage  |  info<---',
      output ? JSON.stringify(output) : output
    );
    return output ?? null;
  } catch (error) {
    console.debug('--->  |  readImage  |  error<---', error);
    throw error;
  }
}
