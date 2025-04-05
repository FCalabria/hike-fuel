import { SignOutButton, useUser } from '@clerk/remix';
import { Link } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import UserIcon from '~/icons/user';

export function Header() {
  const { isSignedIn, user } = useUser();
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuVisible(false);
        menuButtonRef.current?.focus();
      }

      // This is not what the specification says at all https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
      if (
        event.key === 'Tab' &&
        menuRef.current &&
        !menuRef.current.contains(document.activeElement)
      ) {
        setMenuVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className='flex items-center pb-4'>
      <h1 className='text-3xl font-bold text-slate-800'>Hike fuel</h1>
      <div ref={menuRef} className='ml-auto relative'>
        <button
          type='button'
          id='userMenuButton'
          aria-haspopup
          aria-expanded={menuVisible}
          aria-controls='menu'
          className='btn btn-secondary btn-icon'
          aria-label='User menu'
          onClick={toggleMenu}
          ref={menuButtonRef}
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
                <button
                  className='btn btn-secondary text-nowrap'
                  onClick={() => setMenuVisible(false)}
                >
                  Log out
                </button>
              </SignOutButton>
            ) : (
              <Link
                to='/sign-in'
                className='btn btn-secondary text-nowrap'
                onClick={() => setMenuVisible(false)}
              >
                Log in
              </Link>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
