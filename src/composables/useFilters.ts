import { computed } from 'vue'
import { useExpenseStore } from '../stores/useExpenses'

export function useFilters() {
  const store = useExpenseStore()

  const activeFilterCount = computed(() => {
    let count = 0
    if (store.filterCategory !== 'all') count++
    if (store.filterMonth) count++
    return count
  })

  function clearFilters() {
    store.filterCategory = 'all'
    store.filterMonth = ''
  }

  return { activeFilterCount, clearFilters }
}
