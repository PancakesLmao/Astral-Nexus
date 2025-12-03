<template>
  <button
    class="flex items-center gap-2 transition-colors"
    :class="[
      isActive ? 'text-accent hover:text-accent/80' : 'text-dark-400 hover:text-accent',
      buttonClass,
    ]"
    @click.stop="$emit('click')"
  >
    <MessageSquareMore :class="['transition-transform', iconClass]" />
    <span v-if="showCount" :class="countClass">{{ commentsCount }}</span>
    <span v-if="showLabel" :class="labelClass">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { MessageSquareMore } from 'lucide-vue-next'

interface Props {
  commentsCount?: number
  showCount?: boolean
  showLabel?: boolean
  label?: string
  iconClass?: string
  countClass?: string
  labelClass?: string
  buttonClass?: string
  isActive?: boolean
}

withDefaults(defineProps<Props>(), {
  commentsCount: 0,
  showCount: true,
  showLabel: false,
  label: 'Comments',
  iconClass: 'w-5 h-5',
  countClass: 'text-sm',
  labelClass: 'text-sm',
  buttonClass: '',
  isActive: false,
})

defineEmits<{
  click: []
}>()
</script>
