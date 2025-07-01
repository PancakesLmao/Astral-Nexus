import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { translations, languages, type TranslationKey } from '@/shared/utils/languages'

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
      // Save to localStorage for persistence
      localStorage.setItem('preferred-language', languageCode)
    }
  }

  const initializeLanguage = () => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && languages.some((lang) => lang.code === savedLanguage)) {
      currentLanguage.value = savedLanguage
    }
    // Could also check browser language as fallback
    // const browserLang = navigator.language.split('-')[0];
    // if (!savedLanguage && languages.some(lang => lang.code === browserLang)) {
    //   currentLanguage.value = browserLang;
    // }
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
