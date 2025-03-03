import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language files
const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Pass',
      profile: 'Profile',
      settings: 'Settings',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
