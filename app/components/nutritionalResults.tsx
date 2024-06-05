const grades = {
  density: {
    low: 4.41,
    medium: 5.47,
    optimal: 20,
    high: 30,
  },
  carbProt: {
    low: 2.5,
    medium: 2.9,
    optimal: 4,
    high: 4.5,
  },
  calFat: {
    low: 40,
    medium: 50,
    optimal: 70,
    high: 75,
  },
  calSugar: {
    low: 5,
    medium: 10,
    optimal: 20,
    high: 25,
  },
  salt: {
    low: 0.64,
    medium: 1,
    optimal: 1.25,
    high: 1.35,
  },
};

export function NutritionalResults({
  density,
  carbProt,
  calFat,
  calSugar,
  salt,
}: {
  density: number;
  carbProt: number;
  calFat: number;
  calSugar: number;
  salt: number;
}) {
  const getStyle = (key: keyof typeof grades, value: number) => {
    const range = grades[key];
    if (value < range.low) {
      return 'text-yellow-500';
    } else if (value < range.medium) {
      return 'text-lime-600';
    } else if (value < range.optimal) {
      return 'text-green-700';
    } else if (value < range.high) {
      return 'text-amber-800';
    } else {
      return 'text-red-700';
    }
  };

  const getSuggestionMarkdown = (key: keyof typeof grades, value: number) => {
    const range = grades[key];
    if (value < range.medium) {
      return <span> &gt;{range.medium}</span>;
    }
    if (value < range.optimal) {
      return undefined;
    }
    return <span> &lt;{range.optimal}</span>;
  };
  return (
    <div className='bg-white border-slate-800 border-2 p-1'>
      <p className='inline-flex w-full border-slate-800 border-b py-2'>
        Densidad calórica:
        <span
          className={`inline-block w-32 ml-auto ${getStyle(
            'density',
            density
          )}`}
        >
          {density.toFixed(2)} kcal/gr
        </span>
      </p>
      <p className='inline-flex w-full border-slate-800 border-b py-2'>
        Ratio carbohidratos/proteinas:
        <span
          className={`inline-block w-32 ml-auto ${getStyle(
            'carbProt',
            carbProt
          )}`}
        >
          {carbProt.toFixed(2)}
        </span>
      </p>
      <p className='inline-flex w-full border-slate-800 border-b py-2'>
        Grasa:
        <span
          className={`inline-block w-32 ml-auto ${getStyle('calFat', calFat)}`}
        >
          {calFat.toFixed(0)}%
        </span>
      </p>
      <p className='inline-flex w-full border-slate-800 border-b py-2'>
        Azúcar:
        <span
          className={`inline-block w-32 ml-auto ${getStyle('calFat', calFat)}`}
        >
          {calSugar.toFixed(0)}%
        </span>
      </p>
      <p className='inline-flex w-full py-2'>
        Sal:
        <span
          className={`inline-block w-32 ml-auto ${getStyle('calFat', calFat)}`}
        >
          {salt.toFixed(2)} mg/cal
        </span>
      </p>
    </div>
  );
}
