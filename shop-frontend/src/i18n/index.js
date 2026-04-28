import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ja from './locales/ja.json';
import zh from './locales/zh.json';
import en from './locales/en.json';

const savedLang = localStorage.getItem('language') || 'ja';

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'ja',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
