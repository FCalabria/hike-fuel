import { type MetaFunction } from '@remix-run/node';
import { useRouteError } from '@remix-run/react';
import { useRef, useState } from 'react';
import { ImageLoader, ImageLoaderHandle } from '~/components/imageLoader';
import { NutritionalInfo } from '~/components/nutritionalInfo';
import { NutritionalResults } from '~/components/nutritionalResults';
import LoadingIcon from '~/icons/loading';
import PhotoIcon from '~/icons/photo';
import TrashIcon from '~/icons/trash';
import { calculateNutritionalInfo } from '~/utils/nutritionalInfoCalculator';
import { ReadImagePayloadTransformed } from './readImage';
import { type NutritionalData } from '~/sharedTypes';
import { Header } from '~/components/header';

export const meta: MetaFunction = () => {
  return [
    { title: 'Hike fuel' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

interface Food {
  title: string;
  id: number;
  nutritionalData: NutritionalData;
}

const getDefaultNutritionalData: () => NutritionalData = () => ({
  quantity: '',
  carbs: '',
  energy: '',
  fats: '',
  protein: '',
  salt: '',
  sugar: '',
});

const getRandomId = () => {
  return Math.floor(Math.random() * 100);
};

export function ErrorBoundary() {
  // TODO improve error handling in FED
  const error = useRouteError();

  return (
    <div>
      <div className='absolute top-0 w-full p-2 bg-red-700 text-slate-200 flex'>
        Error: {JSON.stringify(error)}
      </div>
      <Index />
    </div>
  );
}

export default function Index() {
  const imageLoaderRef = useRef<ImageLoaderHandle>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [foods, setFoods] = useState<Food[]>([
    {
      title: '',
      id: getRandomId(),
      nutritionalData: getDefaultNutritionalData(),
    },
  ]);

  const nutritionalResult = foods
    .map(({ nutritionalData }) => calculateNutritionalInfo(nutritionalData))
    .reduce((acc, curr) => {
      for (const keyTemp in acc) {
        const key = keyTemp as keyof ReturnType<
          typeof calculateNutritionalInfo
        >;
        if (Object.prototype.hasOwnProperty.call(acc, key)) {
          acc[key] = acc[key] + curr[key];
        }
      }
      return acc;
    });

  const handleAddFood = (
    nutritionalData: NutritionalData = getDefaultNutritionalData()
  ) => {
    setFoods([...foods, { title: '', id: getRandomId(), nutritionalData }]);
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

  const handleAddFoodFromPicture = async (img?: string | null) => {
    if (!img) return;
    setLoadingImage(true);
    try {
      const response = await fetch('/readImage', {
        method: 'POST',
        body: img,
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const result = (await response.json()) as ReadImagePayloadTransformed;
      if (!result) {
        throw new Error('Empty server response');
      }
      handleAddFood(result);
    } catch (error) {
      console.log('LOG  |  handleAddFoodFromPicture  |  error', error);
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-yellow-50  py-4 px-3'>
      <div className='max-w-2xl mx-auto'>
        <Header />
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
                onNutritionChange={(newNutritionalData) => {
                  handleChangeFood(
                    { ...food, nutritionalData: newNutritionalData },
                    i
                  );
                }}
                onTitleChange={(newTitle) => {
                  handleChangeFood({ ...food, title: newTitle }, i);
                }}
                nutritionalData={food.nutritionalData}
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
              disabled={loadingImage}
              onClick={() => {
                imageLoaderRef.current?.loadImage();
              }}
            >
              {loadingImage ? <LoadingIcon /> : <PhotoIcon />}
              Añadir de foto
            </button>
          </div>
        </div>
        <h2 className='text-xl font-bold text-slate-800 pt-4 pb-2'>
          Evaluación total
        </h2>
        <NutritionalResults {...nutritionalResult} />
      </div>
    </div>
  );
}
