<template>
  <div
    class="w-[40rem] h-[100vh] bg-dark-900 border-l border-white/10 overflow-y-auto mt-8 trending-bar"
    style="height: calc(100vh - 80px)"
  >
    <div class="p-8">
      <!-- Trending Hashtags Section -->
      <div class="mb-8">
        <div class="trending-card p-6 rounded-xl bg-dark-800/50 backdrop-blur-sm">
          <h3 class="flex items-center gap-2 text-accent font-semibold text-xl mb-4 pb-2">
            Trending Hashtags
          </h3>
          <div class="space-y-3">
            <div
              v-for="hashtag in trendingHashtags"
              :key="hashtag.id"
              class="trending-item flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20 cursor-pointer transition-all duration-300 hover:bg-accent/20 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
              @click="handleHashtagClick(hashtag)"
            >
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-accent-dark to-accent flex items-center justify-center font-bold text-white text-lg"
              >
                #
              </div>
              <div class="flex-1">
                <div class="font-semibold text-accent">{{ hashtag.name }}</div>
                <div class="text-sm text-dark-300">{{ hashtag.posts_count }} posts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Games Section -->
      <div class="mb-8">
        <div class="trending-card p-6 rounded-xl bg-dark-800/50 backdrop-blur-sm">
          <h3 class="flex items-center gap-2 text-accent font-semibold text-xl mb-4 pb-2">
            Popular Games
          </h3>
          <div class="space-y-3">
            <div
              v-for="game in popularGames"
              :key="game.id"
              class="trending-item flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20 cursor-pointer transition-all duration-300 hover:bg-accent/20 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
              @click="handleGameClick(game)"
            >
              <div class="w-10 h-10 rounded-lg overflow-hidden border-2 border-accent">
                <img
                  :src="game.icon || '/default-game-icon.png'"
                  :alt="game.name"
                  class="w-full h-full object-cover"
                  @error="handleGameIconError"
                />
              </div>
              <div class="flex-1">
                <div class="font-semibold text-white">{{ game.name }}</div>
                <div class="text-sm text-dark-300">{{ game.posts_count }} posts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TrendingHashtag, SuggestedUser, PopularGame } from '@/shared/types'

// Mock data and script remain unchanged
const trendingHashtags = ref<TrendingHashtag[]>([
  {
    id: 1,
    name: 'GenshinImpact',
    posts_count: 1247,
    trend_score: 95,
  },
  {
    id: 2,
    name: 'HonkaiStarRail',
    posts_count: 892,
    trend_score: 88,
  },
  {
    id: 3,
    name: 'ZenlessZoneZero',
    posts_count: 654,
    trend_score: 82,
  },
  {
    id: 4,
    name: 'HonkaiImpact3rd',
    posts_count: 423,
    trend_score: 76,
  },
  {
    id: 5,
    name: 'HoyoFair',
    posts_count: 312,
    trend_score: 71,
  },
])

const popularGames = ref<PopularGame[]>([
  {
    id: 1,
    name: 'Genshin Impact',
    icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/JavaScript.svg',
    posts_count: 2847,
    category: 'Action RPG',
  },
  {
    id: 2,
    name: 'Honkai Star Rail',
    icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/TypeScript.svg',
    posts_count: 1923,
    category: 'Turn-based RPG',
  },
  {
    id: 3,
    name: 'Zenless Zone Zero',
    icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/TypeScript.svg',
    posts_count: 1245,
    category: 'Action RPG',
  },
  {
    id: 4,
    name: 'Honkai Impact 3rd',
    icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/React-Dark.svg',
    posts_count: 867,
    category: 'Action RPG',
  },
])

// TODO: Add back when follow functionality is implemented
// const followLoading = ref<number | string | null>(null)

const emit = defineEmits<{
  hashtagClick: [hashtag: TrendingHashtag]
  followUser: [user: SuggestedUser]
  unfollowUser: [user: SuggestedUser]
  gameClick: [game: PopularGame]
}>()

const handleHashtagClick = (hashtag: TrendingHashtag) => {
  console.log('Hashtag clicked:', hashtag)
  emit('hashtagClick', hashtag)
}

// TODO: Implement follow functionality
/*
const handleFollowClick = async (user: SuggestedUser) => {
  followLoading.value = user.id

  try {
    console.log(user.is_following ? 'Unfollowing' : 'Following', 'user:', user)

    if (user.is_following) {
      emit('unfollowUser', user)
    } else {
      emit('followUser', user)
    }
  } finally {
    setTimeout(() => {
      followLoading.value = null
    }, 500)
  }
}
*/

const handleGameClick = (game: PopularGame) => {
  console.log('Game clicked:', game)
  emit('gameClick', game)
}

// TODO: Implement avatar error handling
/*
const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/TypeScript.svg'
}
*/

const handleGameIconError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/TypeScript.svg'
}
</script>

<style scoped>
/* Custom scrollbar */
.trending-bar {
  scrollbar-width: thin;
  scrollbar-color: #542f87 #0a0b0f;
}

.trending-bar::-webkit-scrollbar {
  width: 6px;
}

.trending-bar::-webkit-scrollbar-track {
  background: #0a0b0f;
  border-radius: 3px;
}

.trending-bar::-webkit-scrollbar-thumb {
  background: #542f87;
  border-radius: 3px;
}

.trending-bar::-webkit-scrollbar-thumb:hover {
  background: #b8aff7;
}
</style>
