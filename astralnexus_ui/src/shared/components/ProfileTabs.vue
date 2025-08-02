<template>
  <div class="bg-[#0a0b0f] border border-white/10 rounded-lg mb-6">
    <div class="border-b border-[rgba(184,175,247,0.2)]">
      <nav class="flex space-x-8 px-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === tab.id
              ? 'border-[#b8aff7] text-[#b8aff7]'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600',
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <div class="p-6">
      <slot :activeTab="activeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  defaultTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [
    { id: 'posts', label: 'Posts' },
    { id: 'comments', label: 'Comments' },
    { id: 'activity', label: 'Activity' },
  ],
  defaultTab: 'posts',
})

const activeTab = ref(props.defaultTab)
</script>
