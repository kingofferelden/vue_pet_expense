import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

import entryBoard from './components/entryBoard.vue'
import expenseList from './components/expenseList.vue'
import expenseForm from './components/expenseDetails.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: entryBoard },
    { path: '/list', component: expenseList },
    { path: '/add', component: expenseForm },
    { path: '/edit/:id', component: expenseForm },
  ],
})

const pinia = createPinia()
pinia.use(createPersistedState()) // ← call it as a factory

createApp(App).use(pinia).use(router).mount('#app')
