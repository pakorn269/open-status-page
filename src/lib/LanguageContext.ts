import { createContext } from 'react';
import type { Language, Translations } from './translations';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  currentTranslations: Translations;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
