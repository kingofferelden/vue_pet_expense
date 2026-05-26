// stores/useExpenseStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import 'pinia-plugin-persistedstate'

export type Category =
  | 'food'
  | 'transport'
  | 'housing'
  | 'entertainment'
  | 'health'
  | 'pet'
  | 'other'

export interface Expense {
  id: string
  description: string
  amount: number
  category: Category
  date: string // ISO string
}

export const useExpenseStore = defineStore(
  'expenses',
  () => {
    // State — equivalent to your BehaviorSubjects
    const expenses = ref<Expense[]>([])
    const budget = ref<number>(200000)
    const filterCategory = ref<Category | 'all'>('all')
    const filterMonth = ref<string>('') // 'YYYY-MM'

    // Getters — equivalent to Angular pipes or selectors
    const filteredExpenses = computed(() => {
      return expenses.value.filter((e) => {
        const categoryMatch = filterCategory.value === 'all' || e.category === filterCategory.value
        const monthMatch = !filterMonth.value || e.date.startsWith(filterMonth.value)
        return categoryMatch && monthMatch
      })
    })

    const totalSpent = computed(() => filteredExpenses.value.reduce((sum, e) => sum + e.amount, 0))

    const budgetRemaining = computed(() => budget.value - totalSpent.value)
    const budgetPercent = computed(() => Math.min((totalSpent.value / budget.value) * 100, 100))

    // Actions — equivalent to service methods
    function addExpense(expense: Omit<Expense, 'id'>) {
      expenses.value.push({ ...expense, id: crypto.randomUUID() })
    }

    function removeExpense(id: string) {
      expenses.value = expenses.value.filter((e) => e.id !== id)
    }

    function updateBudget(amount: number) {
      budget.value = amount
    }

    return {
      expenses,
      budget,
      filterCategory,
      filterMonth,
      filteredExpenses,
      totalSpent,
      budgetRemaining,
      budgetPercent,
      addExpense,
      removeExpense,
      updateBudget,
    }
  },
  {
    persist: true, // pinia-plugin-persistedstate → handles localStorage for you
  },
)
