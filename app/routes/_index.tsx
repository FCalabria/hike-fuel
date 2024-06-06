import type { MetaFunction } from '@remix-run/node';
import { useState } from 'react';
import { DataIds, NutritionalInfo } from '~/components/nutritionalInfo';
import { NutritionalResults } from '~/components/nutritionalResults';

export const meta: MetaFunction = () => {
  return [
    { title: 'Hike fuel' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export default function Index() {
  const [foods, setFoods] = useState([] as { title: string }[]);
  const [density, setDensity] = useState(0);
  const [carbProt, setCarbProt] = useState(0);
  const [calFat, setCalFat] = useState(0);
  const [calSugar, setCalSugar] = useState(0);
  const [salt, setSalt] = useState(0);
  const safeGetter = (map: Record<DataIds, string>) => {
    return (path: DataIds) =>
      map[path] ? parseFloat(map[path].replace(',', '.')) : 0;
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-yellow-50  py-4 px-3'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-slate-800 pb-4'>Hike fuel</h1>
        <NutritionalInfo
          onNutritionChange={(nutritionInfo) => {
            const safeGet = safeGetter(nutritionInfo);
            const calculatedCals =
              safeGet('fats') * 9 +
              safeGet('carbs') * 4 +
              safeGet('protein') * 4;
            setDensity(safeGet('energy') / safeGet('quantity'));
            setCarbProt(safeGet('carbs') / safeGet('protein'));
            setCalFat((safeGet('fats') * 9 * 100) / calculatedCals);
            setCalSugar((safeGet('sugar') * 4 * 100) / calculatedCals);
            setSalt((safeGet('salt') * 1000) / safeGet('quantity'));
          }}
          onTitleChange={(newTitle) => {
            setFoods([{ ...foods[0], title: newTitle }]);
          }}
        />
        <h2 className='text-xl font-bold text-slate-800 pt-4 pb-2'>
          Evaluación
        </h2>
        <NutritionalResults
          density={density}
          carbProt={carbProt}
          calFat={calFat}
          calSugar={calSugar}
          salt={salt}
        />
      </div>
    </div>
  );
}
