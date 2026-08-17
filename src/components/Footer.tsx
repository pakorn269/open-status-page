import React from 'react';
import { ExternalLink, Globe, Heart } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface FooterProps {
  activeTab: string;
  onExitAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ activeTab, onExitAdmin }) => {
  const { t } = useTranslation();

  const communityLinks = [
    {
      title: t('footer.youtube'),
      desc: t('footer.youtubeDesc'),
      url: 'https://www.youtube.com/@9arm.',
      badge: 'YouTube',
      badgeColor: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/60',
      icon: (
        <svg className="w-4 h-4 fill-current text-red-600 dark:text-red-400 shrink-0" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      title: t('footer.twitter'),
      desc: t('footer.twitterDesc'),
      url: 'https://x.com/castby9arm',
      badge: 'X / Twitter',
      badgeColor: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700',
      icon: (
        <svg className="w-4 h-4 fill-current text-gray-900 dark:text-gray-100 shrink-0" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      title: t('footer.facebook'),
      desc: t('footer.facebookDesc'),
      url: 'https://www.facebook.com/groups/9arm.community/',
      badge: 'Facebook Group',
      badgeColor: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/60',
      icon: (
        <svg className="w-4 h-4 fill-current text-blue-600 dark:text-blue-400 shrink-0" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      title: t('footer.discord'),
      desc: t('footer.discordDesc'),
      url: 'https://discord.com/invite/9arm',
      badge: 'Discord',
      badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800/60',
      icon: (
        <svg className="w-4 h-4 fill-current text-[#5865F2] shrink-0" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
    },
    {
      title: t('footer.gatewaySite'),
      desc: t('footer.gatewaySiteDesc'),
      url: 'https://gateway.9arm.co',
      badge: 'API Gateway',
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/60',
      icon: <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    },
  ];

  return (
    <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-6">
      {/* 9arm Community & Ecosystem Section */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100/60 dark:from-gray-900/60 dark:to-gray-900/30 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-red-500 fill-red-500/20" />
            <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {t('footer.communityTitle')}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('footer.communitySubtitle')}
          </p>
        </div>

        {/* 5 Community Links Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {communityLinks.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200/90 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xs transition-all cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.icon}
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {item.title}
                    </span>
                  </div>
                  <ExternalLink size={12} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0" />
                </div>
                <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <span className="text-[10px] text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
                  Visit →
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Community Disclaimer */}
        <p className="mt-4 text-[11px] text-center sm:text-left text-gray-400 dark:text-gray-500 leading-relaxed">
          {t('footer.disclaimer')}
        </p>
      </div>

      {/* Sub-footer (Credits & Exit Admin) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 text-center sm:text-left">
          {t('common.openSource')} ·{' '}
          <a
            href="https://github.com/pakorn269/open-status-page"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline underline-offset-2 font-medium"
          >
            pakorn269/open-status-page
          </a>
        </p>

        {activeTab === 'admin' && onExitAdmin && (
          <button
            onClick={onExitAdmin}
            className="text-xs text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            {t('common.exitAdmin')}
          </button>
        )}
      </div>
    </footer>
  );
};
