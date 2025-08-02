<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <div class="grid grid-cols-3 gap-6 text-center">
      <div class="border-r border-gray-200 last:border-r-0">
        <div class="text-2xl font-bold text-purple-600">{{ stats.posts }}</div>
        <div class="text-gray-600 text-sm">Posts</div>
      </div>
      <div class="border-r border-gray-200 last:border-r-0">
        <div class="text-2xl font-bold text-purple-600">{{ stats.comments }}</div>
        <div class="text-gray-600 text-sm">Comments</div>
      </div>
      <div class="border-r border-gray-200 last:border-r-0">
        <div class="text-2xl font-bold text-purple-600">{{ stats.views }}</div>
        <div class="text-gray-600 text-sm">Views</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  stats: {
    posts: number
    comments: number
    views: number
  }
}

withDefaults(defineProps<Props>(), {
  stats: () => ({
    posts: 0,
    comments: 0,
    views: 0,
  }),
})
</script>
