import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import ImageLoader, { ImageLoaderHandle } from '~/components/imageLoader';
import { NutritionalData, NutritionalInfo } from '~/components/nutritionalInfo';
import { NutritionalResults } from '~/components/nutritionalResults';
import PhotoIcon from '~/icons/photo';
import TrashIcon from '~/icons/trash';
import { calculateNutritionalInfo } from '~/utils/nutritionalInfoCalculator';
import { ReadImageData, readImage } from '~/utils/readImage';

export const meta: MetaFunction = () => {
  return [
    { title: 'Hike fuel' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

interface Food {
  title: string;
  id: number;
  initialNutritionalInfo?: NutritionalData;
}

const getRandomId = () => {
  return Math.floor(Math.random() * 100);
};
type ReadImagePayloadTransformed = { [K in keyof ReadImageData]: string };
type ActionReturn = null | ReadImagePayloadTransformed;
export const action = async ({
  request,
}: ActionFunctionArgs): Promise<ActionReturn> => {
  const body = await request.formData();
  const img = body.get('img');
  if (!img || typeof img !== 'string') {
    return null;
  }
  return readImage(img).then((info) => {
    if (!info) return info;
    return Object.fromEntries(
      Object.entries(info).map(([key, value]) => [
        key,
        value !== null ? value.toString() : '',
      ])
    ) as ReadImagePayloadTransformed;
  });
};

export default function Index() {
  const imageLoaderRef = useRef<ImageLoaderHandle>(null);
  const fetcher = useFetcher<ActionReturn>();
  const [foods, setFoods] = useState<Food[]>([
    { title: '', id: getRandomId() },
  ]);
  const [nutritionalResults, setNutritionalResults] = useState<
    ReturnType<typeof calculateNutritionalInfo>[]
  >([{ calFat: 0, calSugar: 0, carbProt: 0, density: 0, salt: 0 }]);

  const accNutritionalResuts = nutritionalResults.reduce((acc, curr) => {
    for (const keyTemp in acc) {
      const key = keyTemp as keyof ReturnType<typeof calculateNutritionalInfo>;
      if (Object.prototype.hasOwnProperty.call(acc, key)) {
        acc[key] = acc[key] + curr[key];
      }
    }
    return acc;
  });

  useEffect(() => {
    if (fetcher.data) {
      handleAddFood(fetcher.data);
    }
  }, [fetcher.data]);

  const handleAddFood = (initialNutritionalInfo?: NutritionalData) => {
    setFoods([
      ...foods,
      { title: '', id: getRandomId(), initialNutritionalInfo },
    ]);
  };

  const handleRemoveFood = (i: number) => {
    const foodsCopy = [...foods];
    foodsCopy.splice(i, 1);
    setFoods(foodsCopy);
  };

  const handleChangeFood = (newFoodData: Food, i: number) => {
    const foodsCopy = [...foods];
    foodsCopy[i] = newFoodData;
    setFoods(foodsCopy);
  };

  const handleAddFoodFromPicture = (img?: string | null) => {
    if (!img) return;
    fetcher.submit({ img }, { method: 'POST' });
  };

  const handleChangeNutritionalResults = (
    newNutritionInfo: NutritionalData,
    i: number
  ) => {
    const nutritionalResultsCopy = [...nutritionalResults];
    nutritionalResultsCopy[i] = calculateNutritionalInfo(newNutritionInfo);
    setNutritionalResults(nutritionalResultsCopy);
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-yellow-50  py-4 px-3'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-slate-800 pb-4'>Hike fuel</h1>
        <div className='space-y-2'>
          <ImageLoader
            ref={imageLoaderRef}
            onChange={handleAddFoodFromPicture}
          />
          {foods.map((food, i) => (
            <div
              className='grid grid-cols-[1fr_min-content] items-start gap-x-1'
              key={food.id}
            >
              <NutritionalInfo
                onNutritionChange={(nutritionInfo) => {
                  handleChangeNutritionalResults(nutritionInfo, i);
                }}
                onTitleChange={(newTitle) => {
                  handleChangeFood({ ...food, title: newTitle }, i);
                }}
                initialData={food.initialNutritionalInfo}
              />
              {foods.length > 1 ? (
                <button
                  className='btn btn-destructive btn-icon'
                  aria-label='Eliminar comida'
                  onClick={() => {
                    handleRemoveFood(i);
                  }}
                >
                  <TrashIcon />
                </button>
              ) : null}
            </div>
          ))}
          <div className='flex space-x-2'>
            <button className='btn btn-primary' onClick={() => handleAddFood()}>
              Añadir comida
            </button>
            <button
              className='btn btn-primary inline-flex gap-1 items-center'
              disabled={fetcher.state !== 'idle'}
              onClick={() => {
                imageLoaderRef.current?.loadImage();
              }}
            >
              <PhotoIcon />
              Añadir de foto
            </button>
          </div>
        </div>
        <h2 className='text-xl font-bold text-slate-800 pt-4 pb-2'>
          Evaluación total
        </h2>
        <NutritionalResults {...accNutritionalResuts} />
      </div>
    </div>
  );
}
