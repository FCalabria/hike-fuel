import type { MetaFunction } from '@remix-run/node';
import { useState } from 'react';
import { NutritionalData, NutritionalInfo } from '~/components/nutritionalInfo';
import { NutritionalResults } from '~/components/nutritionalResults';
import TrashIcon from '~/icons/trash';
import { calculateNutritionalInfo } from '~/utils/nutritionalInfoCalculator';

export const meta: MetaFunction = () => {
  return [
    { title: 'Hike fuel' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

interface Food {
  title: string;
  id: number;
}

export default function Index() {
  const getRandomId = () => {
    return Math.floor(Math.random() * 100);
  };
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

  const handleAddFood = () => {
    setFoods([...foods, { title: '', id: getRandomId() }]);
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
          <button className='btn btn-primary' onClick={handleAddFood}>
            Añadir comida
          </button>
        </div>
        <h2 className='text-xl font-bold text-slate-800 pt-4 pb-2'>
          Evaluación total
        </h2>
        <NutritionalResults {...accNutritionalResuts} />
      </div>
    </div>
  );
}
