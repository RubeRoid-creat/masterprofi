import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ruTranslations from "./locales/ru.json";
import enTranslations from "./locales/en.json";

const resources = {
  ru: {
    translation: ruTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("language") || "ru", // Язык по умолчанию
    fallbackLng: "ru",
    interpolation: {
      escapeValue: false, // React уже экранирует значения
    },
  });

export default i18n;



