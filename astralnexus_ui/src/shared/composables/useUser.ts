import { storeToRefs } from 'pinia'
import { useUserStore } from '@/shared/stores/user'

export function useUser() {
  const userStore = useUserStore()
  const { user, loading, error, isAuthenticated, userName, userPicture } = storeToRefs(userStore)

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userName,
    userPicture,
    fetchUser: userStore.fetchUser,
    handleLogout: userStore.handleLogout,
    initializeUser: userStore.initializeUser,
    clearUser: userStore.clearUser,
  }
}
