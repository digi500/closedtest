'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('tr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Detect language on mount
    const savedLang = localStorage.getItem('closedtest_lang');
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    } else {
      const browserLang = typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage || '') : 'en';
      if (translations[browserLang]) {
        setLanguage(browserLang);
      } else {
        const baseLang = browserLang.split('-')[0].toLowerCase();
        if (translations[baseLang]) {
          setLanguage(baseLang);
        } else {
          setLanguage('en');
        }
      }
    }
    setMounted(true);
  }, []);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('closedtest_lang', lang);
    }
  };

  // Translation helper function
  const t = (key, replacements = {}) => {
    const dict = translations[language] || translations['en'];
    let text = dict[key] || translations['en'][key] || key;

    // Replace placeholders like {count}
    Object.keys(replacements).forEach((placeholder) => {
      text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, mounted }}>
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
