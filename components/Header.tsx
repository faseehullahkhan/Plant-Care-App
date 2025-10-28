import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { LeafIcon, HomeIcon, CompassIcon, MoonIcon, ThemeSunIcon, UserIcon, LogoutIcon, SettingsIcon } from './Icons';
import { User } from '../types';

type Page = 'dashboard' | 'explore' | 'settings';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

const NavLink: React.FC<{
  onClick: () => void;
  isActive: boolean;
  icon: React.ReactNode;
  text: string;
}> = ({ onClick, isActive, icon, text }) => {
  const activeClasses = 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
  const inactiveClasses = 'text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400';
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      {text}
    </button>
  );
};

const UserMenu: React.FC<{ user: User, onLogout: () => void, onNavigate: (page: Page) => void }> = ({ user, onLogout, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const userInitial = user.name.charAt(0).toUpperCase();

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
            >
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                    userInitial
                )}
            </button>
            {isOpen && (
                <div 
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 focus:outline-none animate-fade-in"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{user.name}</p>
                    </div>
                    <div className="py-1" role="none">
                         <button
                            onClick={() => { onNavigate('settings'); setIsOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                            role="menuitem"
                        >
                            <SettingsIcon className="w-5 h-5" />
                            <span>Profile Settings</span>
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                            role="menuitem"
                        >
                            <LogoutIcon className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-sm sticky top-0 z-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <LeafIcon className="w-8 h-8 text-green-600" />
                <h1 className="hidden sm:block text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                Plant Care
                </h1>
            </div>
            {currentUser && (
                <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 ml-4 pl-4">
                <NavLink 
                    onClick={() => onNavigate('dashboard')}
                    isActive={currentPage === 'dashboard'}
                    icon={<HomeIcon className="w-5 h-5" />}
                    text="Dashboard"
                />
                <NavLink 
                    onClick={() => onNavigate('explore')}
                    isActive={currentPage === 'explore'}
                    icon={<CompassIcon className="w-5 h-5" />}
                    text="Explore"
                />
                </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <ThemeSunIcon className="w-6 h-6" />}
            </button>
            {currentUser && <UserMenu user={currentUser} onLogout={logout} onNavigate={onNavigate} />}
          </div>
        </div>
      </div>
    </header>
  );
};