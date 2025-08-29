import { create } from 'zustand';
import i18n from '../i18n';

export type Language = 'en' | 'ar';

interface LanguageState {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'en',
  isRTL: false,
  
  setLanguage: (lang: Language) => {
    const isRTL = lang === 'ar';
    
    // Update i18n
    i18n.changeLanguage(lang);
    
    // Update document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    set({ language: lang, isRTL });
  },
  
  toggleLanguage: () => {
    const currentLang = get().language;
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    get().setLanguage(newLang);
  },
}));