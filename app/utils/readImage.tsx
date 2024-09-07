import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

export async function readImage(
  base64Img: string
): Promise<ReadImageData | null> {
  // TODO add more sense checks (proper base64, etc)
  if (!base64Img) {
    return null;
  }
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'This image contains a nutritional info label. It can be in any language, but probably is in spanish or english. The information might be duplicated in columns referencing different serving sizes: in that case, always use the data in the first column. I need you to return the values per portion with key-value pairs where the value always represents grams except for the calories where it represents kcal. If you cannot identify some or all the values, use null. ',
            },
            {
              type: 'image_url',
              image_url: {
                url: base64Img,
              },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(nutritionalInfo, 'nutritional_info'),
      model: 'gpt-4o-mini',
    });
    const info = chatCompletion.choices[0].message.content;
    console.debug('--->  |  readImage  |  info<---', info);
    return info ? JSON.parse(info) : null;
  } catch (error) {
    console.debug('--->  |  readImage  |  error<---', error);
    return null;
  }
}
