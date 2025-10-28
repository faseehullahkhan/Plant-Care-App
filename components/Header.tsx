import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LeafIcon, PlusIcon, HomeIcon, CompassIcon, MoonIcon, ThemeSunIcon } from './Icons';

type Page = 'dashboard' | 'explore';

interface HeaderProps {
  onAddPlant: () => void;
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

export const Header: React.FC<HeaderProps> = ({ onAddPlant, onNavigate, currentPage }) => {
  const { theme, toggleTheme } = useTheme();

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
          </div>
          <div className="flex items-center gap-2">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <ThemeSunIcon className="w-6 h-6" />}
            </button>
            <button
                onClick={onAddPlant}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
            >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Add Plant</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
