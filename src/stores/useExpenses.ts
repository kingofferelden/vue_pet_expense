import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import 'pinia-plugin-persistedstate'
import type { Category, Expense } from '@/types/expense'

export const useExpenseStore = defineStore(
  'expenses',
  () => {
    const expenses = ref<Expense[]>([])
    const budget = ref<number>(200000)
    const filterCategory = ref<Category | 'all'>('all')
    const filterMonth = ref<string>('') // 'YYYY-MM'

    const availableCategories = [
      'food',
      'transport',
      'housing',
      'entertainment',
      'health',
      'pet',
      'other',
    ]

    const filteredExpenses = computed(() => {
      return expenses.value.filter((exp) => {
        const categoryMatch =
          filterCategory.value === 'all' || exp.category === filterCategory.value
        const monthMatch = !filterMonth.value || exp.date.startsWith(filterMonth.value)
        return categoryMatch && monthMatch
      })
    })

    const monthlyExpences = computed(() => {
      return expenses.value.filter((exp) => {
        return !filterMonth.value || exp.date.startsWith(filterMonth.value)
      })
    })

    const monthlyAmount = computed(() => {
      return monthlyExpences.value.reduce((sum, exp) => sum + exp.amount, 0)
    })

    const totalSpent = computed(() => {
      return expenses.value.reduce((sum, exp) => sum + exp.amount, 0)
    })

    const budgetRemaining = computed(() => budget.value - totalSpent.value)
    const budgetPercent = computed(() => Math.min((totalSpent.value / budget.value) * 100, 100))

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
      monthlyExpences,
      monthlyAmount,
      totalSpent,
      budgetRemaining,
      budgetPercent,
      addExpense,
      removeExpense,
      updateBudget,
      availableCategories,
    }
  },
  {
    persist: {
      storage: localStorage,
    },
  },
)
