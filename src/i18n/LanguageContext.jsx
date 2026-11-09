import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LANGUAGES, LANGUAGE_KEY, localizedBmi, readLanguage, rememberLanguage, translate } from './translations.js';

const LanguageContext = createContext(null);
const description = 'Roxana: home workouts, simple healthy meals, corrective exercises and an initial BMI assessment.';

export function LanguageProvider({ children }) {
  const [language, updateLanguage] = useState(() => readLanguage());
  const setLanguage = useCallback(next => {
    if (!LANGUAGES.includes(next)) return;
    rememberLanguage(next);
    updateLanguage(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
    document.querySelector('meta[name="description"]')?.setAttribute('content', translate(description, language));
  }, [language]);

  useEffect(() => {
    const sync = event => { if (event.key === LANGUAGE_KEY) updateLanguage(readLanguage()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const value = useMemo(() => ({
    language, setLanguage,
    t: (message, parameters) => translate(message, language, parameters),
    formatBmi: result => localizedBmi(result, language),
  }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('LanguageProvider is required.');
  return context;
}
