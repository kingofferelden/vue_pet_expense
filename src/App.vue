<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <nav class="nav">
      <span class="nav-brand">Expense Tracker</span>
      <div class="nav-links">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/list">Expenses</RouterLink>
        <RouterLink to="/add">+ Add</RouterLink>
      </div>
    </nav>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  background: #f7f7f5;
  font-family: system-ui, sans-serif;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e5e5e3;
}
.nav-brand {
  font-weight: 600;
  font-size: 15px;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 14px;
}
.nav-links a {
  color: #555;
  text-decoration: none;
}
.nav-links a.router-link-active {
  color: #000;
  font-weight: 500;
}
.main {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
</style>
