<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Chart,
  DoughnutController,
  BarController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { useExpenseStore } from '../stores/useExpenses'
import { useChartData } from '../composables/useCharts'

Chart.register(
  DoughnutController,
  BarController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
)

const store = useExpenseStore()
const router = useRouter()
const { byCategory, byDay } = useChartData()

const donutCanvas = ref<HTMLCanvasElement | null>(null)
const barCanvas = ref<HTMLCanvasElement | null>(null)

let donutChart: Chart<'doughnut'> | null = null
let barChart: Chart<'bar'> | null = null

function formatAmount(num: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

const budgetBarWidth = computed(() => Math.min(store.budgetPercent, 100).toFixed(1))

const budgetBarColor = computed(() => {
  if (store.budgetPercent >= 100) return '#dc2626'
  if (store.budgetPercent >= 80) return '#f59e0b'
  return '#16a34a'
})

function reversedExpenses() {
  return [...store.expenses].reverse().slice(0, 5)
}

onMounted(() => {
  if (donutCanvas.value) {
    donutChart = new Chart(donutCanvas.value, {
      type: 'doughnut',
      data: {
        ...byCategory.value,
        datasets: byCategory.value.datasets.map((dataset) => ({
          ...dataset,
          data: dataset.data.map((value) => value ?? 0),
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } },
        },
        cutout: '65%',
      },
    })
  }

  if (barCanvas.value) {
    barChart = new Chart(barCanvas.value, {
      type: 'bar',
      data: {
        ...byDay.value,
        datasets: byDay.value.datasets.map((dataset) => ({
          ...dataset,
          data: dataset.data.map((value) => value ?? 0),
        })),
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f3f1' } },
          x: { grid: { display: false } },
        },
      },
    })
  }
})

watch(byCategory, (newData) => {
  if (donutChart) {
    donutChart.data = {
      ...newData,
      datasets: newData.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.map((value) => value ?? 0),
      })),
    }
    donutChart.update()
  }
})

watch(byDay, (newData) => {
  if (barChart) {
    barChart.data = {
      ...newData,
      datasets: newData.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.map((value) => value ?? 0),
      })),
    }
    barChart.update()
  }
})

onUnmounted(() => {
  donutChart?.destroy()
  barChart?.destroy()
})
</script>

<template>
  <div>
    <div class="dash-header">
      <h1>Dashboard</h1>
      <button class="btn-primary" @click="router.push('/add')">+ Add expense</button>
    </div>

    <div class="summary-grid">
      <div class="card">
        <span class="card-label">Total spent</span>
        <span class="card-value">{{ formatAmount(store.monthlyAmount) }}</span>
      </div>
      <div class="card">
        <span class="card-label">Budget remaining</span>
        <span
          class="card-value"
          :style="{ color: store.budgetRemaining < 0 ? '#dc2626' : 'inherit' }"
        >
          {{ formatAmount(store.budgetRemaining) }}
        </span>
      </div>
      <div class="card">
        <span class="card-label">Expenses logged</span>
        <span class="card-value">{{ store.monthlyExpences.length }}</span>
      </div>
      <div class="card card-budget">
        <div class="budget-row">
          <span class="card-label">Monthly budget</span>
          <input
            type="number"
            class="budget-input"
            :value="store.budget"
            @change="store.updateBudget(Number(($event.target as HTMLInputElement).value))"
          />
        </div>
        <div class="budget-track">
          <div
            class="budget-fill"
            :style="{ width: budgetBarWidth + '%', background: budgetBarColor }"
          />
        </div>
        <span class="budget-pct">{{ budgetBarWidth }}% used</span>
      </div>
    </div>

    <div v-if="store.expenses.length === 0" class="empty">
      <p>No expenses yet — add one to see your charts.</p>
      <button class="btn-primary" @click="router.push('/add')">Add first expense</button>
    </div>

    <template v-else>
      <div class="charts-grid">
        <div class="chart-card">
          <h2>Spending by category</h2>
          <canvas ref="donutCanvas" />
        </div>
        <div class="chart-card">
          <h2>Daily spending</h2>
          <canvas ref="barCanvas" />
        </div>
      </div>

      <div class="recent-card">
        <div class="recent-header">
          <h2>Recent expenses</h2>
          <button class="btn-link" @click="router.push('/list')">View all →</button>
        </div>
        <div v-for="expense in reversedExpenses()" :key="expense.id" class="recent-row">
          <div>
            <p class="recent-desc">{{ expense.description }}</p>
            <p class="recent-date">{{ expense.date }}</p>
          </div>
          <span class="recent-amount">{{ formatAmount(expense.amount) }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dash-header {
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
h2 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 1rem;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 1.5rem;
}
.card {
  background: #fff;
  border: 1px solid #e5e5e3;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.card-label {
  font-size: 12px;
  font-weight: 500;
  color: #888;
}
.card-value {
  font-size: 22px;
  font-weight: 600;
}
.card-budget {
  gap: 8px;
}
.budget-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.budget-input {
  width: 110px;
  padding: 4px 8px;
  border: 1px solid #e5e5e3;
  border-radius: 6px;
  font-size: 13px;
  text-align: right;
}
.budget-track {
  height: 6px;
  background: #f3f3f1;
  border-radius: 999px;
  overflow: hidden;
}
.budget-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s,
    background 0.4s;
}
.budget-pct {
  font-size: 12px;
  color: #888;
}
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 1.5rem;
}
.chart-card {
  background: #fff;
  border: 1px solid #e5e5e3;
  border-radius: 12px;
  padding: 1.25rem;
}
.recent-card {
  background: #fff;
  border: 1px solid #e5e5e3;
  border-radius: 12px;
  padding: 1.25rem;
}
.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.recent-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-top: 1px solid #f3f3f1;
}
.recent-desc {
  font-size: 14px;
  font-weight: 500;
}
.recent-date {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
.recent-amount {
  font-size: 14px;
  font-weight: 600;
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
.btn-link {
  background: none;
  border: none;
  font-size: 13px;
  color: #555;
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
@media (max-width: 600px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
