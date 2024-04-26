import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const routes = [
  { path: '/', redirect: '/tutorial' },
  { path: '/tutorial', component: App },
  { path: '/survey', component: App },
  { path: '/general', component: App }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
