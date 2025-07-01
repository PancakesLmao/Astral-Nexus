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

// this is where you add your translations
export const translations = {
  en: {
    welcome: 'Welcome to',
    appName: 'Astral Nexus',
    description: 'A blog platform for gacha enthusiast',
    getStarted: 'Get Started',
    blog: 'Blog',
    about: 'About',
    contact: 'Contact',
    // Auth
    welcomeBack: 'Welcome back',
    createAccount: 'Create Account',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    username: 'Username',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    backToHome: 'Back to Home',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    confirmPasswordPlaceholder: 'Confirm your password',
    usernamePlaceholder: 'Enter your username',
  },
  vn: {
    welcome: 'Chào mừng đến với',
    appName: 'Astral Nexus',
    description: 'Một nền tảng blog dành cho những người đam mê gacha',
    getStarted: 'Bắt Đầu',
    blog: 'Blog',
    about: 'Giới Thiệu',
    contact: 'Liên Hệ',
    // Auth
    welcomeBack: 'Chào mừng trở lại',
    createAccount: 'Tạo Tài Khoản',
    signIn: 'Đăng Nhập',
    signUp: 'Đăng Ký',
    email: 'Email',
    password: 'Mật Khẩu',
    confirmPassword: 'Xác Nhận Mật Khẩu',
    username: 'Tên người dùng',
    forgotPassword: 'Quên mật khẩu?',
    dontHaveAccount: 'Chưa có tài khoản?',
    alreadyHaveAccount: 'Đã có tài khoản?',
    backToHome: 'Về Trang Chủ',
    emailPlaceholder: 'Nhập email của bạn',
    passwordPlaceholder: 'Nhập mật khẩu',
    confirmPasswordPlaceholder: 'Xác nhận mật khẩu',
    usernamePlaceholder: 'Nhập tên người dùng',
  },
}

export type TranslationKey = keyof typeof translations.en
