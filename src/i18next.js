import i18n from 'i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
// import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { en, pt } from './locales';

const options = {
  interpolation: {
    escapeValue: false, // not needed for react!!
  },
  resources: { en, pt },
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  // debug: true,
  react: {
    wait: false,
    bindI18n: 'languageChanged loaded',
    bindStore: 'added removed',
    nsMode: 'default',
  },
  // backend: {
  // 	// for all available options read the backend's repository readme file
  // 	loadPath: './locales/{{lng}}/{{ns}}.json',
  // },
};

i18n
  // .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init(options);

export default i18n;
