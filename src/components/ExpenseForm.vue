<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExpenseStore } from '../stores/useExpenseStore'
import type { Category } from '../types/expense'

const store = useExpenseStore()
const route = useRoute()
const router = useRouter()

const description = ref('')
const amount = ref<number | ''>('')
const category = ref<Category>('food')
const date = ref(new Date().toISOString().slice(0, 10))
const errors = ref<Record<string, string>>({})

const categories = computed(() => store.availableCategories)

const editId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!editId.value)

onMounted(() => {
  if (isEdit.value) {
    const existing = store.expenses.find((e) => e.id === editId.value)
    if (existing) {
      description.value = existing.description
      amount.value = existing.amount
      category.value = existing.category
      date.value = existing.date
    }
  }
})

function validate(): boolean {
  errors.value = {}
  if (!description.value.trim()) errors.value.description = 'Description is required'
  if (!amount.value || Number(amount.value) <= 0) errors.value.amount = 'Enter a valid amount'
  if (!date.value) errors.value.date = 'Date is required'
  return Object.keys(errors.value).length === 0
}

function submit() {
  if (!validate()) return

  const payload = {
    description: description.value.trim(),
    amount: Number(amount.value),
    category: category.value,
    date: date.value,
  }

  if (isEdit.value && editId.value) {
    store.removeExpense(editId.value)
    store.addExpense(payload)
  } else {
    store.addExpense(payload)
  }

  router.push('/list')
}
</script>

<template>
  <div class="form-card">
    <h1>{{ isEdit ? 'Edit expense' : 'Add expense' }}</h1>

    <div class="field">
      <label>Description</label>
      <input v-model="description" type="text" placeholder="e.g. Grocery run" />
      <span v-if="errors.description" class="error">{{ errors.description }}</span>
    </div>

    <div class="field-row">
      <div class="field">
        <label>Amount ($)</label>
        <input v-model.number="amount" type="number" min="0" step="100" />
        <span v-if="errors.amount" class="error">{{ errors.amount }}</span>
      </div>

      <div class="field">
        <label>Date</label>
        <input v-model="date" type="date" />
        <span v-if="errors.date" class="error">{{ errors.date }}</span>
      </div>
    </div>

    <div class="field">
      <label>Category</label>
      <select v-model="category">
        <option v-for="cat in categories" :key="cat" :value="cat">
          {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
        </option>
      </select>
    </div>

    <div class="actions">
      <button class="btn-secondary" @click="router.back()">Cancel</button>
      <button class="btn-primary" @click="submit">
        {{ isEdit ? 'Save changes' : 'Add expense' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e5e5e3;
  max-width: 520px;
}
h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 1.5rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 1.25rem;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
}
input,
select {
  padding: 8px 12px;
  border: 1px solid #e5e5e3;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}
input:focus,
select:focus {
  border-color: #18181b;
}
.error {
  font-size: 12px;
  color: #dc2626;
}
.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}
.btn-primary {
  background: #18181b;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
.btn-secondary {
  background: none;
  border: 1px solid #e5e5e3;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
</style>
