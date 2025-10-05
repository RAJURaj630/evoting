import React, { useState, useEffect } from 'react'
import i18nService from '../../services/i18nService'
import './LanguageSelector.css'

const LanguageSelector = () => {
  const [languages, setLanguages] = useState([])
  const [currentLang, setCurrentLang] = useState('en')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadLanguages()
    setCurrentLang(i18nService.getCurrentLanguage())
  }, [])

  const loadLanguages = async () => {
    try {
      const result = await i18nService.getSupportedLanguages()
      if (result.success) {
        setLanguages(result.data)
      }
    } catch (error) {
      console.error('Failed to load languages:', error)
    }
  }

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode)
    i18nService.setCurrentLanguage(langCode)
    setIsOpen(false)
    // Reload page to apply translations (in production, use proper i18n context)
    window.location.reload()
  }

  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.code === currentLang)
    return lang ? lang.name : 'English'
  }

  return (
    <div className="language-selector">
      <button 
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
      >
        <span className="language-icon">🌐</span>
        <span className="language-name">{getCurrentLanguageName()}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <div className="language-dropdown-header">
            <strong>Select Language</strong>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${currentLang === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="lang-native">{lang.nativeName}</span>
              <span className="lang-english">{lang.name}</span>
              {currentLang === lang.code && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div 
          className="language-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default LanguageSelector
