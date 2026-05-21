import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translations, LANGUAGES } from './translations.js';

const STORAGE_KEY = 'app_language';

const LanguageContext = createContext(null);

const getNested = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const code = LANGUAGES.some((l) => l.code === saved) ? saved : 'en';
    if (typeof document !== 'undefined') document.documentElement.lang = code;
    return code;
  });

  const setLanguage = useCallback((code) => {
    if (!LANGUAGES.some((l) => l.code === code)) return;
    setLanguageState(code);
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
  }, []);

  const t = useCallback(
    (key, vars = {}) => {
      const pack = translations[language] || translations.en;
      let text = getNested(pack, key) ?? getNested(translations.en, key) ?? key;
      if (typeof text !== 'string') return key;
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
      });
      return text;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, languages: LANGUAGES }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export default LanguageContext;
