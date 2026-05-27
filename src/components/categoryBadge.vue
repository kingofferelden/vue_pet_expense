<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '../types/expense'

// as angular imports
const props = withDefaults(
  defineProps<{
    category: Category
    size?: 'sm' | 'md'
  }>(),
  {
    size: 'md',
  },
)

const builtinColors: Record<string, { bg: string; text: string }> = {
  food: { bg: '#dcfce7', text: '#166534' },
  transport: { bg: '#dbeafe', text: '#1e40af' },
  housing: { bg: '#fef9c3', text: '#854d0e' },
  entertainment: { bg: '#fae8ff', text: '#6b21a8' },
  health: { bg: '#fee2e2', text: '#991b1b' },
  pet: { bg: '#fce7f3', text: '#9d174d' },
  other: { bg: '#f1f5f9', text: '#475569' },
}

function computeColor(str: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return {
    bg: `hsl(${hue}, 60%, 92%)`,
    text: `hsl(${hue}, 60%, 25%)`,
  }
}

const colors = computed(() => builtinColors[props.category] ?? computeColor(props.category))

const label = computed(() => props.category.charAt(0).toUpperCase() + props.category.slice(1))
</script>

<template>
  <span
    class="badge"
    :class="`badge--${props.size}`"
    :style="{ background: colors.bg, color: colors.text }"
  >
    {{ label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  border-radius: 999px;
  font-weight: 500;
}
.badge--md {
  padding: 3px 10px;
  font-size: 12px;
}
.badge--sm {
  padding: 2px 8px;
  font-size: 11px;
}
</style>
