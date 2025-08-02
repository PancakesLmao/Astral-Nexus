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
    welcomeBack: 'Signing in to continue',
    signIn: 'Sign In',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    username: 'Username',
    forgotPassword: 'Forgot Password?',
    backToHome: 'Back to Home',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    confirmPasswordPlaceholder: 'Confirm your password',
    usernamePlaceholder: 'Enter your username',
    orContinueWith: 'Or continue with',
    signInWithGoogle: 'Sign in with Google',
    signInWithDiscord: 'Sign in with Discord',
    // Dashboard
    welcomeToDashboard: 'Welcome to Dashboard',
    hello: 'Hello',
    logout: 'Logout',
    loading: 'Loading...',
    error: 'Error',
    backToLogin: 'Back to Login',
    // Sidebar
    home: 'Home',
    notifications: 'Notifications',
    events: 'Events',
    profile: 'Profile',
    language: 'Language',
    // Notifications
    notificationsDescription: 'Stay updated with all your activity and interactions.',
    noNotifications: 'No notifications yet',
    noNotificationsDescription: 'When you have notifications, they will appear here.',
    // Search
    searchPlaceholder: 'Search posts, users, games...',
    // Sidebar Stats
    posts: 'Posts',
    following: 'Following',
    followers: 'Followers',
    recentActivity: 'Recent Activity',
    newPost: 'New Post',
    editProfile: 'Edit Profile',
    // Profile Header
    follow: 'Follow',
    // Profile Tabs
    comments: 'Comments',
    activity: 'Activity',
    // Profile Posts
    loadingPosts: 'Loading posts...',
    noPostsYet: 'No posts yet',
    startSharing: 'Start sharing your thoughts with the community!',
    loadMorePosts: 'Load More Posts',
    // Profile Comments
    loadingComments: 'Loading comments...',
    noCommentsYet: 'No comments yet',
    startCommenting: 'Start commenting to engage with the community!',
    loadMoreComments: 'Load More Comments',
    // Profile Activities
    loadingActivities: 'Loading activities...',
    noActivitiesYet: 'No activities yet',
    startEngaging: 'Start engaging with the community!',
    loadMoreActivities: 'Load More Activities',
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
    welcomeBack: 'Đăng Nhập Để Tiếp Tục',
    signIn: 'Đăng Nhập',
    email: 'Email',
    password: 'Mật Khẩu',
    confirmPassword: 'Xác Nhận Mật Khẩu',
    username: 'Tên người dùng',
    forgotPassword: 'Quên mật khẩu?',
    backToHome: 'Về Trang Chủ',
    emailPlaceholder: 'Nhập email của bạn',
    passwordPlaceholder: 'Nhập mật khẩu',
    confirmPasswordPlaceholder: 'Xác nhận mật khẩu',
    usernamePlaceholder: 'Nhập tên người dùng',
    orContinueWith: 'Hoặc tiếp tục với',
    signInWithGoogle: 'Đăng nhập với Google',
    signInWithDiscord: 'Đăng nhập với Discord',
    // Dashboard
    welcomeToDashboard: 'Chào mừng đến Dashboard',
    hello: 'Xin chào',
    logout: 'Đăng Xuất',
    loading: 'Đang tải...',
    error: 'Lỗi',
    backToLogin: 'Quay lại Đăng Nhập',
    // Sidebar
    home: 'Trang Chủ',
    notifications: 'Thông Báo',
    events: 'Sự Kiện',
    profile: 'Tài Khoản',
    language: 'Ngôn Ngữ',
    // Notifications
    notificationsDescription: 'Cập nhật tất cả hoạt động và tương tác của bạn.',
    noNotifications: 'Chưa có thông báo',
    noNotificationsDescription: 'Khi bạn có thông báo, chúng sẽ xuất hiện ở đây.',
    // Search
    searchPlaceholder: 'Tìm kiếm bài viết, người dùng, game...',
    // Sidebar Stats
    posts: 'Bài Viết',
    following: 'Đang Theo Dõi',
    followers: 'Người Theo Dõi',
    recentActivity: 'Hoạt Động Gần Đây',
    newPost: 'Bài Viết Mới',
    editProfile: 'Chỉnh Sửa Profile',
    // Profile Header
    follow: 'Theo Dõi',
    // Profile Tabs
    comments: 'Bình Luận',
    activity: 'Hoạt Động',
    // Profile Posts
    loadingPosts: 'Đang tải bài viết...',
    noPostsYet: 'Chưa có bài viết nào',
    startSharing: 'Hãy bắt đầu chia sẻ suy nghĩ của bạn với cộng đồng!',
    loadMorePosts: 'Tải Thêm Bài Viết',
    // Profile Comments
    loadingComments: 'Đang tải bình luận...',
    noCommentsYet: 'Chưa có bình luận nào',
    startCommenting: 'Hãy bắt đầu bình luận để tương tác với cộng đồng!',
    loadMoreComments: 'Tải Thêm Bình Luận',
    // Profile Activities
    loadingActivities: 'Đang tải hoạt động...',
    noActivitiesYet: 'Chưa có hoạt động nào',
    startEngaging: 'Hãy bắt đầu tương tác với cộng đồng!',
    loadMoreActivities: 'Tải Thêm Hoạt Động',
  },
}

export type TranslationKey = keyof typeof translations.en
