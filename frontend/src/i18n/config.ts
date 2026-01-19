import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// Import translation files directly
import trTranslations from '../locales/tr/translation.json';
import enTranslations from '../locales/en/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'tr',
    debug: true,
    
    resources: {
      tr: {
        translation: trTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      
      // keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',
      
      // cache user language on
      caches: ['localStorage'],
    },
    
    ns: ['translation'],
    defaultNS: 'translation',
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;