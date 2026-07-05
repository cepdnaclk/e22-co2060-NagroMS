// ============================================================
// i18n/LanguageContext.jsx
// Lightweight language provider — no extra npm packages needed.
// Wrap the app (or any subtree) in <LanguageProvider> and call
// useLanguage() to get { lang, setLang, t } anywhere below it.
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react';
import translations from './translations';

const STORAGE_KEY = 'nagroms_lang';
export const SUPPORTED_LANGUAGES = ['en', 'si', 'ta'];
const DEFAULT_LANGUAGE = 'en';

const LanguageContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
}

// Reads a dotted path like "login.title" out of a translations object
function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

// Replaces {placeholder} tokens in a string, e.g. t('errors.enterField', { field: 'email' })
function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (match, key) => (vars[key] !== undefined ? vars[key] : match));
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLanguage);

  const setLang = useCallback((next) => {
    if (!SUPPORTED_LANGUAGES.includes(next)) return;
    setLangState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback((key, vars) => {
    const value = getByPath(translations[lang], key) ?? getByPath(translations[DEFAULT_LANGUAGE], key);
    if (value === undefined) return key; // fallback so missing keys are visible during dev
    return interpolate(value, vars);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside a <LanguageProvider>');
  }
  return ctx;
}