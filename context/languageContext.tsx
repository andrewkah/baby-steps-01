import React, { createContext, useContext, useState, ReactNode } from 'react';

// Language context type
interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  toggleLanguage: () => void; // ✅ Add toggle function to context type
}

// Create context with default language 'en'
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<string>('en'); // Default to English

  // ✅ Define the toggle function
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'lg' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
