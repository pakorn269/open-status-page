import React, { useState } from 'react';
import { GitFork, Moon, Sun, Send } from 'lucide-react';
import { SubscribeModal } from './SubscribeModal';

interface HeaderProps {
  isDark: boolean;
  toggleDark: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, toggleDark }) => {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src="/favicon.webp"
              alt="Gateway 9arm Status Logo"
              className="w-7 h-7 rounded-md object-contain shrink-0 shadow-2xs"
            />
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Gateway 9arm Status
            </h1>
          </a>
        </div>

        {/* Actions (Subscribe + GitHub + Dark Mode) */}
        <div className="flex items-center gap-2.5">
          {/* Subscribe to Updates Button */}
          <button
            onClick={() => setIsSubscribeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#229ED9] bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-xs cursor-pointer"
            aria-label="Subscribe to updates via Telegram"
          >
            <Send size={12} className="-rotate-12 fill-[#229ED9]" />
            <span>Subscribe to Updates</span>
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/pakorn269/open-status-page"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="View on GitHub"
          >
            <GitFork size={19} />
          </a>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </div>

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />
    </>
  );
};
