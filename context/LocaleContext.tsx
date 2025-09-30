import React, { createContext, useState, useMemo, useEffect, useCallback } from 'react';

type Locale = 'en' | 'fr';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: () => console.warn('setLocale function not ready'),
});

const LANGUAGE_STORAGE_KEY = 'visual-novel-creator-language';

// Function to get the browser's preferred language, defaulting to 'en'
const getInitialLocale = (): Locale => {
  // 1. Check localStorage for a user-saved preference
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLocale === 'en' || savedLocale === 'fr') {
      return savedLocale;
    }
  }
  
  // 2. Default to English
  return 'en';
};

interface LocaleProviderProps {
  children: React.ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale());

  // Update the <html> lang attribute whenever locale changes for accessibility
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
    } catch (e) {
      console.error("Could not save language preference to localStorage.", e);
    }
  }, []);

  const contextValue = useMemo(() => ({
    locale,
    setLocale,
  }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
};
