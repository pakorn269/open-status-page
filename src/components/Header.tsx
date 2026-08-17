import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  toggleDark: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, toggleDark }) => {
  return (
    <div className="flex justify-between items-center mb-12">
      <h1 className="text-3xl font-serif text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span className="text-orange-500 text-2xl">✳</span> Gateway 9arm Status
      </h1>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleDark}
          className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold px-4 py-2 rounded-sm shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 uppercase tracking-widest transition-colors">
          Subscribe to Updates
        </button>
      </div>
    </div>
  );
};
