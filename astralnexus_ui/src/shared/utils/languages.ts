export interface Language {
  code: string
  name: string
  flag: string
}

export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'vn',
    name: 'Tiếng Việt',
    flag: '🇻🇳',
  },
]

export const translations = {
  en: {
    welcome: 'Welcome to',
    appName: 'Astral Nexus',
    description: 'A blog platform for gacha enthusiast',
    getStarted: 'Get Started',
    home: 'Home',
    blog: 'Blog',
    about: 'About',
    contact: 'Contact',
  },
  vn: {
    welcome: 'Chào mừng đến với',
    appName: 'Astral Nexus',
    description: 'Một nền tảng blog dành cho những người đam mê gacha',
    getStarted: 'Bắt Đầu',
    home: 'Trang Chủ',
    blog: 'Blog',
    about: 'Giới Thiệu',
    contact: 'Liên Hệ',
  },
}

export type TranslationKey = keyof typeof translations.en
