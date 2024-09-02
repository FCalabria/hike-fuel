import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function readImage(base64Img: string) {
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
              text: 'This image contains a nutritional info label. It can be in any language, but probably is in spanish or english. I need you to return the values per portion in form of a JSON object, with key-value pairs where the value is always a number and the keys are: quantity, energy, carbs, sugar, fats, protein, salt. The values need to be in grams or kcal. If you cannot identify some or all the values, use null.',
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
      model: 'gpt-4o-mini',
    });
    console.log('MC  |  readImage  |  chatCompletion:', chatCompletion);
    return chatCompletion.choices[0];
  } catch (error) {
    console.log('MC  |  readImage  |  error:', error);
    return null;
  }
}
