import { useUserStore } from '@/shared/stores/user'

export function useUser() {
  const userStore = useUserStore()

  return {
    user: userStore.user,
    loading: userStore.loading,
    error: userStore.error,
    isAuthenticated: userStore.isAuthenticated,
    userName: userStore.userName,
    userPicture: userStore.userPicture,
    fetchUser: userStore.fetchUser,
    handleLogout: userStore.handleLogout,
    initializeUser: userStore.initializeUser,
    clearUser: userStore.clearUser,
  }
}
