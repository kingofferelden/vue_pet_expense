import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

import Dashboard from './components/Dashboard.vue'
import ExpenseList from './components/ExpenseList.vue'
import ExpenseForm from './components/ExpenseForm.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/list', component: ExpenseList },
    { path: '/add', component: ExpenseForm },
    { path: '/edit/:id', component: ExpenseForm },
  ],
})

const pinia = createPinia()
pinia.use(createPersistedState()) // ← call it as a factory

createApp(App).use(pinia).use(router).mount('#app')
