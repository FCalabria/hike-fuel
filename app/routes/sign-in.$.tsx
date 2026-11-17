import { Link } from 'react-router';

export default function SignInPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-yellow-50 py-4 px-3'>
      <div className='max-w-2xl mx-auto mt-8 p-6 bg-white border-2 border-slate-800 rounded-sm shadow-md text-center'>
        <h2 className='text-2xl font-bold text-slate-800 mb-4'>Inicio de sesión</h2>
        <p className='text-slate-600 mb-6'>
          La autenticación con Supabase estará disponible próximamente.
        </p>
        <Link to='/' className='btn btn-primary inline-block'>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
