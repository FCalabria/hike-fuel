import { useState } from 'react';
const rows = [
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
    unit: 'g',
    style: 'border-b',
  },
  {
    id: 'carbs',
    label: 'Hidratos de carbono',
    placeholder: '36',
    unit: 'g',
    style: 'border-b',
  },
  {
    id: 'sugar',
    label: 'de los cuales, azúcares',
    placeholder: '31,1',
    unit: 'g',
    style: 'border-b pl-3 italic',
  },
  {
    id: 'protein',
    label: 'Proteinas',
    placeholder: '45,2',
    unit: 'g',
    style: 'border-b',
  },
  {
    id: 'salt',
    label: 'Sal',
    placeholder: '0,03',
    unit: 'g',
    style: '',
    step: '0.1',
  },
] as const;
export type DataIds = (typeof rows)[number]['id'];

export function NutritionalInfo({
  onNutritionChange,
  onTitleChange,
}: {
  onNutritionChange(formState: Record<DataIds, string>): void;
  onTitleChange(newTitle: string): void;
}) {
  const [title, setTitle] = useState('');
  const [formState, setFormState] = useState(() =>
    rows.reduce((map, { id }) => {
      map[id] = '';
      return map;
    }, {} as Record<DataIds, string>)
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleFormChange = (id: DataIds, newValue: string) => {
    const newFormState = { ...formState, [id]: newValue };
    setFormState(newFormState);
    onNutritionChange(newFormState);
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
            onChange={(e) => handleFormChange(id, e.target.value)}
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
