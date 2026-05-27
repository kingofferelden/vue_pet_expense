<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpenseStore } from '../stores/useExpenses'
import type { SortKey } from '../types/sort'
import { capitalize } from '@/utils/capitalize'

const store = useExpenseStore()
const router = useRouter()

const sortKey = ref<SortKey>('date')
const direction = ref<'asc' | 'desc'>('desc')
const rowId = ref<string | null>(null) // which row is pending delete

const categories = computed(() => store.availableCategories)

const sortedExpenses = computed(() => {
  return [...store.filteredExpenses].sort((a, b) => {
    const valA = a[sortKey.value]
    const valB = b[sortKey.value]
    if (sortKey.value === 'amount') {
      return direction.value === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number)
    }
    return direction.value === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA))
  })
})

const totalVisible = computed(() =>
  sortedExpenses.value.reduce((acc, expense) => acc + expense.amount, 0),
)

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    direction.value = direction.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    direction.value = 'desc'
  }
}

function confirmDelete(id: string) {
  rowId.value = id
}

function doDelete() {
  if (rowId.value) {
    store.removeExpense(rowId.value)
    rowId.value = null
  }
}

const categoryColors: Record<string, string> = {
  food: '#dcfce7',
  transport: '#dbeafe',
  housing: '#fef9c3',
  entertainment: '#fae8ff',
  health: '#fee2e2',
  pet: '#fce7f3',
  other: '#f1f5f9',
}

const categoryText: Record<string, string> = {
  food: '#166534',
  transport: '#1e40af',
  housing: '#854d0e',
  entertainment: '#6b21a8',
  health: '#991b1b',
  pet: '#9d174d',
  other: '#475569',
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <div class="list-header">
      <h1>Expenses</h1>
      <button class="btn-primary" @click="router.push('/add')">+ Add expense</button>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Category</label>
        <select v-model="store.filterCategory">
          <option v-for="category in categories" :key="category" :value="category">
            {{ category === 'all' ? 'All categories' : capitalize(category) }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Month</label>
        <input type="month" v-model="store.filterMonth" />
      </div>

      <button
        v-if="store.filterCategory !== 'all' || store.filterMonth"
        class="btn-clear"
        @click="((store.filterCategory = 'all'), (store.filterMonth = ''))"
      >
        Clear filters
      </button>
    </div>

    <div v-if="sortedExpenses.length === 0" class="empty">
      <p>No expenses found</p>
      <button class="btn-primary" @click="router.push('/add')">Add your first expense</button>
    </div>

    <template v-else>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th @click="toggleSort('date')" :class="{ sorted: sortKey === 'date' }">
                Date
                <span class="sort-icon">{{
                  sortKey === 'date' ? (direction === 'asc' ? '↑' : '↓') : '↕'
                }}</span>
              </th>
              <th>Description</th>
              <th @click="toggleSort('category')" :class="{ sorted: sortKey === 'category' }">
                Category
                <span class="sort-icon">{{
                  sortKey === 'category' ? (direction === 'asc' ? '↑' : '↓') : '↕'
                }}</span>
              </th>
              <th @click="toggleSort('amount')" :class="{ sorted: sortKey === 'amount' }">
                Amount
                <span class="sort-icon">{{
                  sortKey === 'amount' ? (direction === 'asc' ? '↑' : '↓') : '↓'
                }}</span>
              </th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="expense in sortedExpenses" :key="expense.id">
              <td class="td-date">{{ formatDate(expense.date) }}</td>
              <td class="td-desc">{{ expense.description }}</td>
              <td>
                <span
                  class="badge"
                  :style="{
                    background: categoryColors[expense.category],
                    color: categoryText[expense.category],
                  }"
                >
                  {{ expense.category }}
                </span>
              </td>
              <td class="td-amount">{{ formatAmount(expense.amount) }}</td>
              <td class="td-actions">
                <template v-if="rowId === expense.id">
                  <button class="btn-danger-sm" @click="doDelete">Delete</button>
                  <button class="btn-ghost-sm" @click="rowId = null">Cancel</button>
                </template>
                <template v-else>
                  <button class="btn-ghost-sm" @click="router.push(`/edit/${expense.id}`)">
                    Edit
                  </button>
                  <button class="btn-ghost-sm" @click="confirmDelete(expense.id)">Delete</button>
                </template>
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr>
              <td colspan="3" class="tf-label">Showing {{ sortedExpenses.length }} expenses</td>
              <td class="tf-total">{{ formatAmount(totalVisible) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}
.filters {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: #777;
}
select,
input[type='month'] {
  padding: 7px 10px;
  border: 1px solid #e5e5e3;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
}
.btn-clear {
  padding: 7px 14px;
  border: 1px solid #e5e5e3;
  border-radius: 8px;
  background: none;
  font-size: 13px;
  cursor: pointer;
  color: #666;
}
.table-wrap {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e5e3;
  overflow: hidden;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
thead tr {
  border-bottom: 1px solid #e5e5e3;
}
th {
  padding: 11px 14px;
  text-align: left;
  font-weight: 500;
  font-size: 13px;
  color: #777;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
th:last-child {
  cursor: default;
}
th.sorted {
  color: #18181b;
}
.sort-icon {
  margin-left: 4px;
  font-size: 11px;
}
td {
  padding: 11px 14px;
  border-bottom: 1px solid #f3f3f1;
}
tr:last-child td {
  border-bottom: none;
}
.td-date {
  color: #888;
  font-size: 13px;
  white-space: nowrap;
}
.td-desc {
  font-weight: 500;
}
.td-amount {
  font-weight: 600;
  text-align: right;
  white-space: nowrap;
}
.td-actions {
  text-align: right;
  white-space: nowrap;
}
tfoot td {
  background: #fafaf9;
  border-top: 1px solid #e5e5e3;
  font-size: 13px;
}
.tf-label {
  color: #999;
  padding: 10px 14px;
}
.tf-total {
  font-weight: 600;
  text-align: right;
  padding: 10px 14px;
}
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
.btn-primary {
  background: #18181b;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}
.btn-ghost-sm {
  background: none;
  border: 1px solid #e5e5e3;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 4px;
}
.btn-danger-sm {
  background: #fee2e2;
  color: #991b1b;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
.empty {
  text-align: center;
  padding: 4rem 2rem;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e5e3;
}
.empty p {
  color: #888;
  margin-bottom: 1rem;
}
</style>
