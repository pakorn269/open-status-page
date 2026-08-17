import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

export { LanguageProvider } from './LanguageProvider';
export { translations, type Language, type Translations } from './translations';
export { LanguageContext, type LanguageContextType } from './LanguageContext';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t, language, setLanguage, toggleLanguage, currentTranslations } = useLanguage();
  return { t, language, setLanguage, toggleLanguage, currentTranslations };
};
