/**
 * Internationalization (i18n) Service
 * Multi-language support for accessibility
 */

const translations = {
  en: {
    app: {
      name: 'E-Voting System',
      tagline: 'Secure, Transparent, Democratic'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      voterId: 'Voter ID',
      aadhaar: 'Aadhaar Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      email: 'Email Address',
      phone: 'Phone Number',
      name: 'Full Name'
    },
    voting: {
      castVote: 'Cast Your Vote',
      selectCandidate: 'Select a Candidate',
      confirmVote: 'Confirm Your Vote',
      voteSuccess: 'Vote cast successfully!',
      alreadyVoted: 'You have already voted',
      viewResults: 'View Results'
    },
    verification: {
      verifyAadhaar: 'Verify Aadhaar',
      verifyFace: 'Verify Face',
      livenessCheck: 'Liveness Check',
      deviceBinding: 'Bind Device',
      verificationPending: 'Verification Pending',
      verificationComplete: 'Verification Complete'
    },
    messages: {
      welcome: 'Welcome to E-Voting System',
      thankYou: 'Thank you for voting!',
      error: 'An error occurred',
      success: 'Operation successful'
    }
  },
  hi: {
    app: {
      name: 'ई-वोटिंग प्रणाली',
      tagline: 'सुरक्षित, पारदर्शी, लोकतांत्रिक'
    },
    auth: {
      login: 'लॉगिन',
      register: 'पंजीकरण',
      logout: 'लॉगआउट',
      voterId: 'मतदाता पहचान पत्र',
      aadhaar: 'आधार संख्या',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      email: 'ईमेल पता',
      phone: 'फोन नंबर',
      name: 'पूरा नाम'
    },
    voting: {
      castVote: 'अपना वोट डालें',
      selectCandidate: 'एक उम्मीदवार चुनें',
      confirmVote: 'अपने वोट की पुष्टि करें',
      voteSuccess: 'वोट सफलतापूर्वक डाला गया!',
      alreadyVoted: 'आप पहले ही वोट कर चुके हैं',
      viewResults: 'परिणाम देखें'
    },
    verification: {
      verifyAadhaar: 'आधार सत्यापित करें',
      verifyFace: 'चेहरा सत्यापित करें',
      livenessCheck: 'जीवंतता जांच',
      deviceBinding: 'डिवाइस बाइंड करें',
      verificationPending: 'सत्यापन लंबित',
      verificationComplete: 'सत्यापन पूर्ण'
    },
    messages: {
      welcome: 'ई-वोटिंग प्रणाली में आपका स्वागत है',
      thankYou: 'वोट देने के लिए धन्यवाद!',
      error: 'एक त्रुटि हुई',
      success: 'ऑपरेशन सफल'
    }
  },
  bn: {
    app: {
      name: 'ই-ভোটিং সিস্টেম',
      tagline: 'নিরাপদ, স্বচ্ছ, গণতান্ত্রিক'
    },
    auth: {
      login: 'লগইন',
      register: 'নিবন্ধন',
      logout: 'লগআউট',
      voterId: 'ভোটার আইডি',
      aadhaar: 'আধার নম্বর',
      password: 'পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      email: 'ইমেইল ঠিকানা',
      phone: 'ফোন নম্বর',
      name: 'পুরো নাম'
    },
    voting: {
      castVote: 'আপনার ভোট দিন',
      selectCandidate: 'একজন প্রার্থী নির্বাচন করুন',
      confirmVote: 'আপনার ভোট নিশ্চিত করুন',
      voteSuccess: 'ভোট সফলভাবে দেওয়া হয়েছে!',
      alreadyVoted: 'আপনি ইতিমধ্যে ভোট দিয়েছেন',
      viewResults: 'ফলাফল দেখুন'
    },
    verification: {
      verifyAadhaar: 'আধার যাচাই করুন',
      verifyFace: 'মুখ যাচাই করুন',
      livenessCheck: 'জীবন্ততা পরীক্ষা',
      deviceBinding: 'ডিভাইস বাইন্ড করুন',
      verificationPending: 'যাচাইকরণ মুলতুবি',
      verificationComplete: 'যাচাইকরণ সম্পূর্ণ'
    },
    messages: {
      welcome: 'ই-ভোটিং সিস্টেমে স্বাগতম',
      thankYou: 'ভোট দেওয়ার জন্য ধন্যবাদ!',
      error: 'একটি ত্রুটি ঘটেছে',
      success: 'অপারেশন সফল'
    }
  },
  te: {
    app: {
      name: 'ఇ-ఓటింగ్ వ్యవస్థ',
      tagline: 'సురక్షితం, పారదర్శకం, ప్రజాస్వామ్యం'
    },
    auth: {
      login: 'లాగిన్',
      register: 'నమోదు',
      logout: 'లాగౌట్',
      voterId: 'ఓటరు ID',
      aadhaar: 'ఆధార్ నంబర్',
      password: 'పాస్‌వర్డ్',
      confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి',
      email: 'ఇమెయిల్ చిరునామా',
      phone: 'ఫోన్ నంబర్',
      name: 'పూర్తి పేరు'
    },
    voting: {
      castVote: 'మీ ఓటు వేయండి',
      selectCandidate: 'అభ్యర్థిని ఎంచుకోండి',
      confirmVote: 'మీ ఓటును నిర్ధారించండి',
      voteSuccess: 'ఓటు విజయవంతంగా వేయబడింది!',
      alreadyVoted: 'మీరు ఇప్పటికే ఓటు వేశారు',
      viewResults: 'ఫలితాలను చూడండి'
    },
    verification: {
      verifyAadhaar: 'ఆధార్ ధృవీకరించండి',
      verifyFace: 'ముఖం ధృవీకరించండి',
      livenessCheck: 'లైవ్‌నెస్ తనిఖీ',
      deviceBinding: 'పరికరాన్ని బైండ్ చేయండి',
      verificationPending: 'ధృవీకరణ పెండింగ్‌లో ఉంది',
      verificationComplete: 'ధృవీకరణ పూర్తయింది'
    },
    messages: {
      welcome: 'ఇ-ఓటింగ్ వ్యవస్థకు స్వాగతం',
      thankYou: 'ఓటు వేసినందుకు ధన్యవాదాలు!',
      error: 'లోపం సంభవించింది',
      success: 'ఆపరేషన్ విజయవంతమైంది'
    }
  },
  ta: {
    app: {
      name: 'மின்-வாக்களிப்பு அமைப்பு',
      tagline: 'பாதுகாப்பான, வெளிப்படையான, ஜனநாயக'
    },
    auth: {
      login: 'உள்நுழைவு',
      register: 'பதிவு',
      logout: 'வெளியேறு',
      voterId: 'வாக்காளர் அடையாள அட்டை',
      aadhaar: 'ஆதார் எண்',
      password: 'கடவுச்சொல்',
      confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
      email: 'மின்னஞ்சல் முகவரி',
      phone: 'தொலைபேசி எண்',
      name: 'முழு பெயர்'
    },
    voting: {
      castVote: 'உங்கள் வாக்கை பதிவு செய்யுங்கள்',
      selectCandidate: 'ஒரு வேட்பாளரைத் தேர்ந்தெடுக்கவும்',
      confirmVote: 'உங்கள் வாக்கை உறுதிப்படுத்தவும்',
      voteSuccess: 'வாக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது!',
      alreadyVoted: 'நீங்கள் ஏற்கனவே வாக்களித்துவிட்டீர்கள்',
      viewResults: 'முடிவுகளைக் காண்க'
    },
    verification: {
      verifyAadhaar: 'ஆதாரை சரிபார்க்கவும்',
      verifyFace: 'முகத்தை சரிபார்க்கவும்',
      livenessCheck: 'உயிர்ப்பு சரிபார்ப்பு',
      deviceBinding: 'சாதனத்தை இணைக்கவும்',
      verificationPending: 'சரிபார்ப்பு நிலுவையில் உள்ளது',
      verificationComplete: 'சரிபார்ப்பு முடிந்தது'
    },
    messages: {
      welcome: 'மின்-வாக்களிப்பு அமைப்புக்கு வரவேற்கிறோம்',
      thankYou: 'வாக்களித்ததற்கு நன்றி!',
      error: 'பிழை ஏற்பட்டது',
      success: 'செயல்பாடு வெற்றிகரமாக'
    }
  }
};

class I18nService {
  constructor() {
    this.defaultLanguage = 'en';
    this.supportedLanguages = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa'];
  }

  /**
   * Get translation for a key
   */
  translate(key, language = 'en') {
    const lang = this.supportedLanguages.includes(language) ? language : this.defaultLanguage;
    const keys = key.split('.');
    
    let translation = translations[lang];
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        // Fallback to English
        translation = translations.en;
        for (const k of keys) {
          if (translation && translation[k]) {
            translation = translation[k];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }
    
    return translation;
  }

  /**
   * Get all translations for a language
   */
  getTranslations(language = 'en') {
    const lang = this.supportedLanguages.includes(language) ? language : this.defaultLanguage;
    return translations[lang] || translations.en;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
    ];
  }

  /**
   * Detect language from browser
   */
  detectLanguage(acceptLanguage) {
    if (!acceptLanguage) return this.defaultLanguage;
    
    const languages = acceptLanguage.split(',').map(lang => {
      const parts = lang.split(';');
      return parts[0].trim().split('-')[0];
    });
    
    for (const lang of languages) {
      if (this.supportedLanguages.includes(lang)) {
        return lang;
      }
    }
    
    return this.defaultLanguage;
  }
}

module.exports = new I18nService();
