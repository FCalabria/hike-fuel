import { SignOutButton, useUser } from '@clerk/remix';
import { Link } from '@remix-run/react';
import { ReactNode, useState } from 'react';
import UserIcon from '~/icons/user';

export function Header() {
  const { isSignedIn, user } = useUser();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setTimeout(() => setMenuVisible(!menuVisible), 100);
  };

  return (
    <div className='flex items-center pb-4'>
      <h1 className='text-3xl font-bold text-slate-800'>Hike fuel</h1>
      <div className='ml-auto relative'>
        <button
          type='button'
          id='userMenuButton'
          aria-haspopup
          aria-expanded={menuVisible}
          className='btn btn-secondary btn-icon'
          aria-label='User menu'
          onClick={toggleMenu}
          onBlur={toggleMenu}
        >
          {user && user.hasImage ? (
            <img className='w-6 rounded-sm' src={user.imageUrl} />
          ) : (
            <UserIcon />
          )}
        </button>
        <ul
          id='userMenu'
          role='menu'
          aria-labelledby='userMenuButton'
          className={`absolute py-2 px-4 mt-2 right-0 bg-white rounded-sm shadow-md ${
            !menuVisible && 'hidden'
          }`}
        >
          <li role='menuitem'>
            {isSignedIn ? (
              <SignOutButton redirectUrl='/'>
                <button className='btn btn-secondary text-nowrap'>
                  Log out
                </button>
              </SignOutButton>
            ) : (
              <Link to='/sign-in' className='btn btn-secondary text-nowrap'>
                Log in
              </Link>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
