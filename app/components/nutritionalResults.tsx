import GaugeIcon from '../icons/gauge';

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
  const getLevel = (key: keyof typeof grades, value: number) => {
    const range = grades[key];
    if (value < range.low) {
      return 'veryLow';
    } else if (value < range.medium) {
      return 'low';
    } else if (value < range.optimal) {
      return 'good';
    } else if (value < range.high) {
      return 'high';
    } else {
      return 'veryHigh';
    }
  };

  const getRowMarkdown = ({
    label,
    id,
    value,
    unit,
    decimals = 0,
    isLast = false,
  }: {
    label: string;
    id: keyof typeof grades;
    value: number;
    unit: string;
    decimals?: number;
    isLast?: boolean;
  }) => {
    const level = getLevel(id, value);
    const colors = {
      low: {
        text: 'text-yellow-500',
        fill: 'fill-yellow-500',
      },
      veryLow: {
        text: 'text-lime-600',
        fill: 'fill-lime-600',
      },
      good: {
        text: 'text-green-700',
        fill: 'fill-green-700',
      },
      high: {
        text: 'text-amber-800',
        fill: 'fill-amber-800',
      },
      veryHigh: {
        text: 'text-red-700',
        fill: 'fill-red-700',
      },
    };
    return (
      <p
        key={id}
        className={`inline-flex w-full border-slate-800 py-2 ${
          isLast ? '' : 'border-b'
        }`}
      >
        {label}:
        <span className={`inline-block w-32 ml-auto ${colors[level].text}`}>
          {value.toFixed(decimals)} {unit}
        </span>
        <span className={`ml-2 ${colors[level].fill}`}>
          <GaugeIcon level={level} />
        </span>
      </p>
    );
  };

  return (
    <div className='bg-white border-slate-800 border-2 p-1'>
      {[
        {
          label: 'Densidad calórica',
          id: 'density' as const,
          value: density,
          unit: 'kcal/gr',
          decimals: 2,
        },
        {
          label: 'Ratio carbohidratos/proteinas',
          id: 'carbProt' as const,
          value: carbProt,
          unit: '',
          decimals: 2,
        },
        {
          label: 'Grasa',
          id: 'calFat' as const,
          value: calFat,
          unit: '%',
        },
        {
          label: 'Azúcar',
          id: 'calSugar' as const,
          value: calSugar,
          unit: '%',
        },
        {
          label: 'Sal',
          id: 'salt' as const,
          value: salt,
          unit: 'mg/cal',
          decimals: 2,
          isLast: true,
        },
      ].map(getRowMarkdown)}
    </div>
  );
}
