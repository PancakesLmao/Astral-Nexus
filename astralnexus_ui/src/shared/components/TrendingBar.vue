<template>
  <div class="w-[40rem] h-[100vh] bg-dark-900 border-l border-white/10 overflow-y-auto">
    <div class="p-8">
      <!-- Trending Hashtags Section -->
      <div class="mb-8">
        <div
          class="trending-card p-6 border border-[#b8aff7] rounded-xl bg-dark-800/50 backdrop-blur-sm"
        >
          <h3
            class="flex items-center gap-2 text-accent font-semibold text-xl mb-4 pb-2 border-accent/30"
          >
            <span class="text-xl"></span>
            Trending #hashtags
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

      <!-- Suggested Users Section -->
      <div class="mb-8">
        <div
          class="trending-card p-6 border border-[#b8aff7] rounded-xl bg-dark-800/50 backdrop-blur-sm"
        >
          <h3
            class="flex items-center gap-2 text-accent font-semibold text-xl mb-4 pb-2 border-accent/30"
          >
            <span class="text-xl"></span>
            Suggested Users
          </h3>
          <div class="space-y-3">
            <div
              v-for="user in suggestedUsers"
              :key="user.id"
              class="trending-item flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20 transition-all duration-300 hover:bg-accent/20 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
            >
              <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-accent">
                <img
                  :src="user.avatar || '/default-avatar.png'"
                  :alt="user.name"
                  class="w-full h-full object-cover"
                  @error="handleAvatarError"
                />
              </div>
              <div class="flex-1">
                <div class="font-semibold text-white">{{ user.name }}</div>
                <div class="text-sm text-dark-300 mb-2">@{{ user.username }}</div>
                <button
                  class="px-3 py-1 text-xs font-medium rounded-md transition-all duration-300"
                  :class="
                    user.is_following
                      ? 'bg-dark-300 text-white hover:bg-red-500'
                      : 'bg-accent text-dark-900 hover:bg-accent-light'
                  "
                  @click="handleFollowClick(user)"
                  :disabled="followLoading === user.id"
                >
                  <span
                    v-if="followLoading === user.id"
                    class="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                  ></span>
                  <span v-else>{{ user.is_following ? 'Following' : 'Follow' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Games Section -->
      <div class="mb-8">
        <div
          class="trending-card p-6 border border-[#b8aff7] rounded-xl bg-dark-800/50 backdrop-blur-sm"
        >
          <h3
            class="flex items-center gap-2 text-accent font-semibold text-xl mb-4 pb-2 border-accent/30"
          >
            <span class="text-2xl"></span>
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

// Types
interface TrendingHashtag {
  id: number | string
  name: string
  posts_count: number
  trend_score: number
}

interface SuggestedUser {
  id: number | string
  username: string
  name: string
  avatar?: string
  followers_count: number
  is_following: boolean
  bio?: string
}

interface PopularGame {
  id: number | string
  name: string
  icon?: string
  posts_count: number
  category: string
}

// Mock data directly in the component
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

const suggestedUsers = ref<SuggestedUser[]>([
  {
    id: 1,
    username: 'genshin_master',
    name: 'Elena Vasquez',
    avatar: 'https://i.pravatar.cc/150?img=1',
    followers_count: 15420,
    is_following: false,
    bio: 'Genshin Impact content creator and theorycrafting expert',
  },
  {
    id: 2,
    username: 'hsr_strategist',
    name: 'Marcus Chen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    followers_count: 8930,
    is_following: false,
    bio: 'Honkai Star Rail team building specialist',
  },
  {
    id: 3,
    username: 'hoyo_news',
    name: 'Sarah Kim',
    avatar: 'https://i.pravatar.cc/150?img=3',
    followers_count: 23450,
    is_following: true,
    bio: 'Latest news and updates from the Hoyoverse',
  },
  {
    id: 4,
    username: 'zzz_beta_pro',
    name: 'Alex Rivera',
    avatar: 'https://i.pravatar.cc/150?img=4',
    followers_count: 5670,
    is_following: false,
    bio: 'Zenless Zone Zero beta tester and guide creator',
  },
  {
    id: 5,
    username: 'hi3_veteran',
    name: 'Luna Zhang',
    avatar: 'https://i.pravatar.cc/150?img=5',
    followers_count: 12340,
    is_following: false,
    bio: 'Honkai Impact 3rd veteran player since 2017',
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
  {
    id: 5,
    name: 'Tears of Themis',
    icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/NodeJS-Dark.svg',
    posts_count: 234,
    category: 'Visual Novel',
  },
])

// State
const followLoading = ref<number | string | null>(null)

// Emits for communicating with parent components if needed
const emit = defineEmits<{
  hashtagClick: [hashtag: TrendingHashtag]
  followUser: [user: SuggestedUser]
  unfollowUser: [user: SuggestedUser]
  gameClick: [game: PopularGame]
}>()

// Methods
const handleHashtagClick = (hashtag: TrendingHashtag) => {
  console.log('Hashtag clicked:', hashtag)
  emit('hashtagClick', hashtag)
  // You could navigate to hashtag page or filter posts
  // router.push(`/?hashtag=${hashtag.name}`)
}

const handleFollowClick = async (user: SuggestedUser) => {
  followLoading.value = user.id

  try {
    console.log(user.is_following ? 'Unfollowing' : 'Following', 'user:', user)

    // Update user follow status locally
    const userIndex = suggestedUsers.value.findIndex((u) => u.id === user.id)
    if (userIndex !== -1) {
      suggestedUsers.value[userIndex].is_following = !suggestedUsers.value[userIndex].is_following
      suggestedUsers.value[userIndex].followers_count = suggestedUsers.value[userIndex].is_following
        ? suggestedUsers.value[userIndex].followers_count + 1
        : Math.max(0, suggestedUsers.value[userIndex].followers_count - 1)
    }

    if (user.is_following) {
      emit('unfollowUser', user)
    } else {
      emit('followUser', user)
    }
  } finally {
    // Reset loading after a short delay to show feedback
    setTimeout(() => {
      followLoading.value = null
    }, 500)
  }
}

const handleGameClick = (game: PopularGame) => {
  console.log('Game clicked:', game)
  emit('gameClick', game)
  // You could navigate to game-specific posts
  // router.push(`/?game=${game.name}`)
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/TypeScript.svg'
}

const handleGameIconError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/TypeScript.svg'
}
</script>

<style scoped>
/* Custom scrollbar for the trending bar */
.trending-bar::-webkit-scrollbar {
  width: 6px;
}

.trending-bar::-webkit-scrollbar-track {
  background: #0a0b0f;
}

.trending-bar::-webkit-scrollbar-thumb {
  background: #542f87;
  border-radius: 3px;
}

.trending-bar::-webkit-scrollbar-thumb:hover {
  background: #b8aff7;
}

/* Card hover effects */
.trending-card {
  transition: all 0.3s ease;
}

.trending-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(184, 175, 247, 0.1);
}
</style>
