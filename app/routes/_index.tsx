import type { MetaFunction } from '@remix-run/node';
import { useState } from 'react';
import { NutritionalInfo } from '~/components/nutritionalInfo';
import { NutritionalResults } from '~/components/nutritionalResults';
import { calculateNutritionalInfo } from '~/utils/nutritionalInfoCalculator';

export const meta: MetaFunction = () => {
  return [
    { title: 'Hike fuel' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export default function Index() {
  const [foods, setFoods] = useState([] as { title: string }[]);
  const [nutritionalResults, setNutritionalResults] = useState<
    ReturnType<typeof calculateNutritionalInfo>
  >({ calFat: 0, calSugar: 0, carbProt: 0, density: 0, salt: 0 });

  return (
    <div className='min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-yellow-50  py-4 px-3'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-slate-800 pb-4'>Hike fuel</h1>
        <NutritionalInfo
          onNutritionChange={(nutritionInfo) => {
            setNutritionalResults(calculateNutritionalInfo(nutritionInfo));
          }}
          onTitleChange={(newTitle) => {
            setFoods([{ ...foods[0], title: newTitle }]);
          }}
        />
        <h2 className='text-xl font-bold text-slate-800 pt-4 pb-2'>
          Evaluación
        </h2>
        <NutritionalResults {...nutritionalResults} />
      </div>
    </div>
  );
}
