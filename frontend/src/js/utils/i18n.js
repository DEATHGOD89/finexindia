export class GlobalI18n {
    constructor() {
        this.supportedLanguages = [
            'hi', 'en', 'zh', 'ja', 'ko', 'ta', 'te', 'ml', 'kn', 
            'bn', 'pa', 'mr', 'gu', 'or', 'as', 'ur', 'fa', 'ar',
            'id', 'ms', 'th', 'vi', 'fil', 'my', 'km', 'lo',
            'fr', 'de', 'es', 'it', 'pt', 'ru', 'pl', 'nl', 
            'sv', 'da', 'no', 'fi', 'el', 'cs', 'hu', 'ro',
            'bg', 'sr', 'hr', 'sk', 'sl', 'lt', 'lv', 'et',
            'tr', 'he', 'sw', 'af', 'zu', 'am', 'yo', 'ig'
        ];
        this.currentLanguage = this.detectLanguage();
        this.translations = {};
    }
    
    detectLanguage() {
        const saved = localStorage.getItem('globalLanguage');
        if (saved && this.supportedLanguages.includes(saved)) {
            return saved;
        }
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }
        return 'en';
    }
    
    async loadTranslations(language) {
        if (this.translations[language]) return this.translations[language];
        try {
            const response = await fetch(`/locales/${language}.json`);
            if (response.ok) {
                const data = await response.json();
                this.translations[language] = data;
                return data;
            }
        } catch (e) {
            console.warn(`Failed to load translations for ${language}`);
        }
        if (language !== 'en') return this.loadTranslations('en');
        return {};
    }
    
    translate(key, replacements = {}) {
        const translations = this.translations[this.currentLanguage] || {};
        let text = translations[key] || key;
        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replace(`{${placeholder}}`, value);
        }
        return text;
    }
    
    async setLanguage(language) {
        if (!this.supportedLanguages.includes(language)) language = 'en';
        
        this.currentLanguage = language;
        localStorage.setItem('globalLanguage', language);
        
        await this.loadTranslations(language);
        this.applyTranslations();
        
        const rtlLanguages = ['ar', 'he', 'ur', 'fa'];
        document.documentElement.dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
        
        const langBtn = document.getElementById('globalLangBtn');
        if (langBtn) {
            const langNames = { hi: 'हिन्दी', en: 'English', fr: 'Français', es: 'Español' };
            langBtn.textContent = langNames[language] || language.toUpperCase();
        }
        
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
    }
    
    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = this.translate(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = this.translate(key);
        });
    }
}
export const globalI18n = new GlobalI18n();
