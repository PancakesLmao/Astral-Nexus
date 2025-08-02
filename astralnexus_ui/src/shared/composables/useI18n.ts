import { ref, computed } from 'vue'
import { translations, type TranslationKey } from '@/shared/utils/languages'

// Current language state
const currentLanguage = ref<'en' | 'vn'>('en')

export function useI18n() {
  const t = (key: TranslationKey): string => {
    return translations[currentLanguage.value][key] || key
  }

  const setLanguage = (lang: 'en' | 'vn') => {
    currentLanguage.value = lang
    localStorage.setItem('language', lang)
  }

  const getCurrentLanguage = computed(() => currentLanguage.value)

  // Initialize language from localStorage on first use
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'vn'
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vn')) {
      currentLanguage.value = savedLanguage
    }
  }

  return {
    t,
    setLanguage,
    currentLanguage: getCurrentLanguage,
  }
}
