import { useState } from 'react';
import { NutritionalValues } from '~/sharedTypes';
const rows: {
  id: NutritionalValues;
  label: string;
  placeholder: `${number}` | `${number},${number}`;
  unit: 'gr' | 'mg' | 'kcal';
  style: string;
  step?: string;
}[] = [
  {
    id: 'quantity',
    label: 'Porción',
    placeholder: '100',
    unit: 'gr',
    style: 'border-b-4',
  },
  {
    id: 'energy',
    label: 'Energía',
    placeholder: '320',
    unit: 'kcal',
    style: 'border-b',
  },
  {
    id: 'fats',
    label: 'Grasas',
    placeholder: '31,8',
    unit: 'gr',
    style: 'border-b',
  },
  {
    id: 'carbs',
    label: 'Hidratos de carbono',
    placeholder: '36',
    unit: 'gr',
    style: 'border-b',
  },
  {
    id: 'sugar',
    label: 'de los cuales, azúcares',
    placeholder: '31,1',
    unit: 'gr',
    style: 'border-b pl-3 italic',
  },
  {
    id: 'protein',
    label: 'Proteinas',
    placeholder: '45,2',
    unit: 'gr',
    style: 'border-b',
  },
  {
    id: 'salt',
    label: 'Sal',
    placeholder: '0,03',
    unit: 'gr',
    style: '',
    step: '0.1',
  },
];

export function NutritionalInfo({
  onNutritionChange,
  onTitleChange,
}: {
  onNutritionChange(formState: Record<NutritionalValues, string>): void;
  onTitleChange(newTitle: string): void;
}) {
  const [title, setTitle] = useState('');
  const [formState, setFormState] = useState(() =>
    rows.reduce((map, { id }) => {
      map[id] = '';
      return map;
    }, {} as Record<NutritionalValues, string>)
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleFormChange = (
    id: NutritionalValues,
    target: EventTarget & HTMLInputElement
  ) => {
    const newFormState = { ...formState, [id]: target.value };
    setFormState(newFormState);
    if (target.checkValidity()) {
      onNutritionChange(newFormState);
    }
  };

  return (
    <div className='bg-white border-slate-800 border-2 p-1'>
      <input
        className='text-xl font-semibold border-b-2 border-slate-800 w-full pt-1 pb-2'
        type='text'
        placeholder='Alimento'
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
      />
      {rows.map(({ id, label, placeholder, unit, style, step }) => (
        <div
          key={id}
          className={`flex border-slate-800 items-baseline ${style}`}
        >
          <label htmlFor={id} className='grow py-2'>
            {label}
          </label>
          <input
            id={id}
            name={id}
            className='w-20 text-right'
            type='number'
            placeholder={placeholder}
            onChange={(e) => {
              handleFormChange(id, e.target);
            }}
            value={formState[id]}
            min='0'
            step={`${step || 1}`}
          />
          <p className='pl-1'>{unit}</p>
        </div>
      ))}
    </div>
  );
}
