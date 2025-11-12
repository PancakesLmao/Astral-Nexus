import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSessionDomain } from '../utils'
import { translations, languages, type TranslationKey } from '@/shared/utils/languages'
import { setCookie, getCookie } from '@/shared/utils'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref<string>('en')

  const currentTranslations = computed(() => {
    return translations[currentLanguage.value as keyof typeof translations] || translations.en
  })

  const availableLanguages = computed(() => languages)

  const currentLanguageInfo = computed(() => {
    return languages.find((lang) => lang.code === currentLanguage.value) || languages[0]
  })

  const setLanguage = (languageCode: string) => {
    if (languages.some((lang) => lang.code === languageCode)) {
      currentLanguage.value = languageCode
      // Save to cookie for cross-subdomain persistence
      setCookie('preferred-language', languageCode, {
        domain: getSessionDomain(), // For cross-subdomain cookie sharing
        path: '/',
        maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
        sameSite: 'Lax',
      })
    }
  }

  const initializeLanguage = () => {
    // Try to get saved language from cookie first (cross-subdomain)
    const savedLanguage = getCookie('preferred-language')
    if (savedLanguage && languages.some((lang) => lang.code === savedLanguage)) {
      currentLanguage.value = savedLanguage
      return
    }

    // Fallback to localStorage for backwards compatibility
    const localStorageLanguage = localStorage.getItem('preferred-language')
    if (localStorageLanguage && languages.some((lang) => lang.code === localStorageLanguage)) {
      currentLanguage.value = localStorageLanguage
      setCookie('preferred-language', localStorageLanguage, {
        domain: getSessionDomain(),
        path: '/',
        maxAge: 365 * 24 * 60 * 60, // 1 year
        sameSite: 'Lax',
      })
      localStorage.removeItem('preferred-language')
      return
    }

    // Could also check browser language as fallback
    const browserLang = navigator.language.split('-')[0]
    if (languages.some((lang) => lang.code === browserLang)) {
      currentLanguage.value = browserLang
      // Save browser language preference
      setCookie('preferred-language', browserLang, {
        domain: getSessionDomain(),
        path: '/',
        maxAge: 365 * 24 * 60 * 60, // 1 year
        sameSite: 'Lax',
      })
    }
  }

  const t = (key: TranslationKey): string => {
    return currentTranslations.value[key] || key
  }

  return {
    currentLanguage: computed(() => currentLanguage.value),
    currentLanguageInfo,
    availableLanguages,
    setLanguage,
    initializeLanguage,
    t,
  }
})
