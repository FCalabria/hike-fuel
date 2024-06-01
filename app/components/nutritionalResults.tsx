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
  return (
    <div className='bg-white border-slate-800 border-2 p-1'>
      <p>Densidad calórica: {density.toFixed(0)}kcal/gr</p>
      <p>Ratio carbohidratos/proteinas: {carbProt.toFixed(2)}</p>
      <p>Grasa: {calFat.toFixed(2)}%</p>
      <p>Azúcar: {calSugar.toFixed(2)}%</p>
      <p>Sal: {salt.toFixed(0)} mg/cal</p>
    </div>
  );
}
