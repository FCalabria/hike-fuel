import { ActionFunctionArgs, TypedResponse, json } from '@remix-run/node';
import { ReadImageData, readImage } from '~/utils/readImage';

export type ReadImagePayloadTransformed =
  | {
      [K in keyof ReadImageData]: string;
    }
  | null;

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<ReadImagePayloadTransformed> => {
  const img = await request.text();
  if (!img || typeof img !== 'string') {
    throw json('img is empty or not the correct type', { status: 400 });
  }
  return readImage(img)
    .then((info) => {
      if (!info) throw json(null, { status: 204 });
      return Object.fromEntries(
        Object.entries(info).map(([key, value]) => [
          key,
          value !== null ? value.toString() : '',
        ])
      ) as ReadImagePayloadTransformed;
    })
    .catch((error) => {
      throw json(error, { status: 500 });
    });
};
