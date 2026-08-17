import React from 'react';
import { GitFork, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  toggleDark: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, toggleDark }) => {
  return (
    <div className="flex justify-between items-center mb-12">
      <div className="flex items-center gap-3">
        <span className="text-orange-500 text-2xl leading-none">✳</span>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Gateway 9arm Status
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* GitHub link */}
        <a
          href="https://github.com/pakorn269/open-status-page"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="View on GitHub"
        >
          <GitFork size={20} />
        </a>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
};
