import { computed } from 'vue'
import { usePostsStore } from '@/shared/stores/posts'
import type { GameCategory } from '@/shared/types'

export function useGameCategories() {
  const postsStore = usePostsStore()

  const gameCategories = computed(() => postsStore.gameCategories)
  const selectedCategory = computed(() => postsStore.selectedCategory)

  const fetchGameCategories = async () => {
    try {
      await postsStore.loadGameCategories()
      console.log('Game categories loaded from store')
    } catch (error) {
      console.error('Failed to load game categories:', error)
      throw error
    }
  }

  const selectCategory = (category: GameCategory) => {
    postsStore.selectGameCategory(category)
    console.log('Selected category:', category.game_name)
  }

  return {
    gameCategories,
    selectedCategory,
    fetchGameCategories,
    selectCategory,
  }
}
