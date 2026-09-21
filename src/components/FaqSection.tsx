import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Zap, Layers, ShieldCheck, Users } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface FaqItem {
  id: string;
  tag: string;
  tagColor: string;
  icon: React.ReactNode;
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const { t } = useTranslation();
  // Open the first item (Rate Limit 429) by default as it's the most searched topic
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    q1: true,
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const faqItems: FaqItem[] = [
    {
      id: 'q1',
      tag: t('faq.tagRateLimit'),
      tagColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/80',
      icon: <Zap size={16} className="text-amber-500" />,
      question: t('faq.q1Title'),
      answer: t('faq.q1Answer'),
    },
    {
      id: 'q2',
      tag: t('faq.tagQuota'),
      tagColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800/80',
      icon: <Layers size={16} className="text-blue-500" />,
      question: t('faq.q2Title'),
      answer: t('faq.q2Answer'),
    },
    {
      id: 'q3',
      tag: t('componentList.maxConcurrency'),
      tagColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800/80',
      icon: <Users size={16} className="text-purple-500" />,
      question: t('faq.q3Title'),
      answer: t('faq.q3Answer'),
    },
    {
      id: 'q4',
      tag: t('faq.tagTransparency'),
      tagColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80',
      icon: <ShieldCheck size={16} className="text-emerald-500" />,
      question: t('faq.q4Title'),
      answer: t('faq.q4Answer'),
    },
  ];

  return (
    <section id="faq-limits" className="mt-12 mb-10 font-sans scroll-mt-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
          <HelpCircle size={18} />
        </div>
        <div>
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-gray-100">
            {t('faq.title')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('faq.subtitle')}
          </p>
        </div>
      </div>

      {/* Accordion List */}
      <div className="mt-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xs divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        {faqItems.map((item) => {
          const isOpen = !!openItems[item.id];

          return (
            <div key={item.id} className="transition-colors">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full py-4 px-5 flex items-start sm:items-center justify-between gap-3 text-left hover:bg-gray-50/60 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <span className="mt-0.5 sm:mt-0 shrink-0">{item.icon}</span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5">
                    <span className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-100">
                      {item.question}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border self-start ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>
                </div>

                <div className={`p-1 rounded-md text-gray-400 dark:text-gray-500 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 text-gray-700 dark:text-gray-200' : ''
                }`}>
                  <ChevronDown size={16} />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-gray-800/40 bg-gray-50/30 dark:bg-gray-850/20">
                  <div className="whitespace-pre-line pl-7 sm:pl-7">
                    {item.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
