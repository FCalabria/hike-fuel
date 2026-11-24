import { Link } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import LogoIcon from '~/icons/logo';
import UserIcon from '~/icons/user';

export function Header() {
  const [isSignedIn] = useState(false);
  const [user] = useState<{ hasImage?: boolean; imageUrl?: string } | null>(null);
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
      <h1
        className='flex items-center gap-2.5 text-[30px] font-extrabold tracking-[-0.04em] leading-none'
        style={{
          fontFamily:
            "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
      >
        <LogoIcon className='h-9 w-auto shrink-0' />
        <span>
          <span className='text-[#231B15]'>Hike</span>{' '}
          <span className='text-[#F28B24] -ml-[0.16em]'>Fuel</span>
        </span>
      </h1>
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
          {user && user.hasImage && user.imageUrl ? (
            <img className='w-6 rounded-sm' src={user.imageUrl} alt='User avatar' />
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
              <button
                className='btn btn-secondary text-nowrap'
                onClick={() => setMenuVisible(false)}
              >
                Log out
              </button>
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
