'use client';

/**
 * Multilingual Context & Provider
 * Manages English ('en') and Telugu ('te') state with persistence across navigation and page refreshes.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, translations, TranslationDictionary } from './translations';
import APP_CONFIG from '@/config/app-config';

interface LanguageContextType {
  locale: Locale;
  setLocale: (lang: Locale) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(APP_CONFIG.defaultLanguage);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sfic_preferred_locale') as Locale | null;
      if (saved && (saved === 'en' || saved === 'te')) {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const setLocale = (lang: Locale) => {
    setLocaleState(lang);
    try {
      localStorage.setItem('sfic_preferred_locale', lang);
      document.cookie = `sfic_locale=${lang}; path=/; max-age=31536000`;
      document.documentElement.lang = lang;
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
