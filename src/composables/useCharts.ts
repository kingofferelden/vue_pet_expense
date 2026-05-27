import { computed } from 'vue'
import { useExpenseStore } from '../stores/useExpenses'
import { capitalize } from '@/utils/capitalize'

export function useChartData() {
  const store = useExpenseStore()

  const categoryLabels = ['food', 'transport', 'housing', 'entertainment', 'health', 'pet', 'other']
  const categoryColors = ['#166534', '#1e40af', '#854d0e', '#6b21a8', '#991b1b', '#475569']
  const categoryBg = ['#dcfce7', '#dbeafe', '#fef9c3', '#fae8ff', '#fee2e2', '#f23df1', '#f1f5f9']

  const byCategory = computed(() => {
    const totals: Record<string, number> = Object.fromEntries(categoryLabels.map((cat) => [cat, 0]))
    store.monthlyExpences.forEach((exp) => {
      totals[exp.category] = (totals[exp.category] ?? 0) + exp.amount
    })
    return {
      labels: categoryLabels.map((cat) => capitalize(cat)),
      datasets: [
        {
          data: categoryLabels.map((cat) => totals[cat]),
          backgroundColor: categoryBg,
          borderColor: categoryColors,
          borderWidth: 1,
        },
      ],
    }
  })

  const byDay = computed(() => {
    const totals: Record<string, number> = {}
    store.monthlyExpences.forEach((exp) => {
      totals[exp.date] = (totals[exp.date] ?? 0) + exp.amount
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
