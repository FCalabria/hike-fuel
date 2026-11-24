interface LogoIconProps {
  className?: string;
}

export default function LogoIcon({ className = 'h-9 w-auto' }: LogoIconProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 86 52'
      fill='none'
      className={className}
      aria-hidden='true'
    >
      {/* Borne positivo derecho conectado a ras */}
      <path
        d='M80 17H83C84.6569 17 86 18.3431 86 20V32C86 33.6569 84.6569 35 83 35H80V17Z'
        fill='#231B15'
      />
      {/* Carcasa exterior */}
      <rect
        x='2'
        y='3'
        width='76'
        height='46'
        rx='9'
        stroke='#231B15'
        strokeWidth='4'
        fill='#FAF7F2'
      />
      {/* 1. Terracotta (#C84B31): Subida a Pico 1 */}
      <path d='M9 30L19 21.1V42H9V30Z' fill='#C84B31' />
      {/* 2. Ochre (#DF8B16): Pico 1 */}
      <path d='M22 18.4L27 14L32 18.5V42H22V18.4Z' fill='#DF8B16' />
      {/* 3. Warm Amber (#F28B24): Collado y rampa */}
      <path d='M35 21.3L38 24L45 17.5V42H35V21.3Z' fill='#F28B24' />
      {/* 4. Verde Transición (#7FA980): Pico 2 (Cumbre mayor) */}
      <path d='M48 14.7L53 10L58 15V42H48V14.7Z' fill='#7FA980' />
      {/* 5. Trail Sage (#588157): Bajada final */}
      <path d='M61 18L71 28V42H61V18Z' fill='#588157' />
    </svg>
  );
}
