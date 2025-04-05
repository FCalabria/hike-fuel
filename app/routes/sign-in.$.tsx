import { SignIn } from '@clerk/remix';

export default function Page() {
  // Check out GoogleOneTap component
  return (
    <div className='min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-yellow-50  py-4 px-3'>
      <div className='max-w-2xl mx-auto mt-8 flex justify-center'>
        <SignIn />
      </div>
    </div>
  );
}
