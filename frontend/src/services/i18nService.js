import api from './api';

/**
 * Internationalization Service
 * Handles multi-language support
 */
class I18nService {
  // Get supported languages
  async getSupportedLanguages() {
    const response = await api.get('/api/v2/i18n/languages');
    return response.data;
  }

  // Get translations for a language
  async getTranslations(lang) {
    const response = await api.get(`/api/v2/i18n/translations/${lang}`);
    return response.data;
  }

  // Get current language from localStorage
  getCurrentLanguage() {
    return localStorage.getItem('evoting_language') || 'en';
  }

  // Set current language
  setCurrentLanguage(lang) {
    localStorage.setItem('evoting_language', lang);
  }
}

export default new I18nService();
