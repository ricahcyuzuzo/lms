import React, { useState, useRef, useEffect } from 'react';

interface ProfileDropdownProps {
  user: {
    names: string;
    email?: string;
    avatar?: string;
  };
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center focus:outline-none border border-gray-300 rounded-lg bg-white px-2 py-1 shadow-sm hover:shadow-md transition min-w-[0]"
        style={{ minHeight: '32px' }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {user.avatar && user.avatar.startsWith('blob:') ? (
          <img
            src={user.avatar}
            alt={user.names}
            className="w-7 h-7 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base border border-gray-300">
            {user.avatar || (user.names ? user.names.charAt(0).toUpperCase() : '?')}
          </div>
        )}
        <span className="ml-2 text-sm font-medium text-gray-900 max-w-[90px] truncate hidden sm:block">{user.names}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 px-3 min-w-[160px] flex flex-col items-start" style={{minWidth: '160px'}}>
          <div className="flex items-center w-full mb-2 pb-2 border-b border-gray-100">
            {user.avatar && user.avatar.startsWith('blob:') ? (
              <img
                src={user.avatar}
                alt={user.names}
                className="w-8 h-8 rounded-full object-cover border border-gray-300 mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base border border-gray-300 mr-2">
                {user.avatar || (user.names ? user.names.charAt(0).toUpperCase() : '?')}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-sm">{user.names}</span>
              {user.email && <span className="text-gray-500 text-xs truncate max-w-[90px]">{user.email}</span>}
            </div>
          </div>
          <button
            className="w-full px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm transition-colors duration-200 border border-red-600"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
