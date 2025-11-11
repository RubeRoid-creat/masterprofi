import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

type Language = "ru" | "en";

export function useLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem("language") as Language) || "ru"
  );

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "ru" || savedLanguage === "en")) {
      setLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const toggleLanguage = () => {
    const newLang = language === "ru" ? "en" : "ru";
    changeLanguage(newLang);
  };

  return {
    language,
    changeLanguage,
    toggleLanguage,
    t: useTranslation().t,
  };
}



