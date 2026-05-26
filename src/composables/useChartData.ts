import { computed } from 'vue'
import { useExpenseStore } from '../stores/useExpenseStore'

export function useChartData() {
  const store = useExpenseStore()

  const categoryLabels = ['food', 'transport', 'housing', 'entertainment', 'health', 'other']
  const categoryColors = ['#166534', '#1e40af', '#854d0e', '#6b21a8', '#991b1b', '#475569']
  const categoryBg = ['#dcfce7', '#dbeafe', '#fef9c3', '#fae8ff', '#fee2e2', '#f1f5f9']

  const byCategory = computed(() => {
    const totals: Record<string, number> = Object.fromEntries(categoryLabels.map((c) => [c, 0]))
    store.filteredExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] ?? 0) + e.amount
    })
    return {
      labels: categoryLabels.map((c) => c.charAt(0).toUpperCase() + c.slice(1)),
      datasets: [
        {
          data: categoryLabels.map((c) => totals[c]),
          backgroundColor: categoryBg,
          borderColor: categoryColors,
          borderWidth: 1,
        },
      ],
    }
  })

  const byDay = computed(() => {
    const totals: Record<string, number> = {}
    store.filteredExpenses.forEach((e) => {
      totals[e.date] = (totals[e.date] ?? 0) + e.amount
    })
    const sorted = Object.entries(totals).sort(([a], [b]) => a.localeCompare(b))
    return {
      labels: sorted.map(([date]) =>
        new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      ),
      datasets: [
        {
          label: 'Daily spending',
          data: sorted.map(([, v]) => v),
          backgroundColor: '#dbeafe',
          borderColor: '#1e40af',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    }
  })

  return { byCategory, byDay }
}
