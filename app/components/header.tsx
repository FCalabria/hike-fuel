import { ReactNode, useState } from 'react';
import UserIcon from '~/icons/user';

export function Header() {
  const userIsLoggedIn = false;
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
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
          <UserIcon />
        </button>
        <ul
          id='userMenu'
          role='menu'
          aria-labelledby='userMenuButton'
          className={`absolute py-2 px-4 mt-2 right-0 bg-white rounded-sm shadow-md ${
            !menuVisible && 'hidden'
          }`}
        >
          {userIsLoggedIn ? (
            <MenuItem>Log out</MenuItem>
          ) : (
            <MenuItem>Log in</MenuItem>
          )}
        </ul>
      </div>
    </div>
  );
}

function MenuItem({ children }: { children: ReactNode }) {
  return (
    <li role='menuitem'>
      <button className='btn btn-secondary text-nowrap'>{children}</button>
    </li>
  );
}
