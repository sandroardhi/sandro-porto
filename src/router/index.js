import { createRouter, createWebHistory } from 'vue-router'
import MalleableHome from '../views/MalleableHome.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: MalleableHome },
    { path: '/work/:id', name: 'work', component: () => import('../views/MalleableCase.vue') },
    // old case-study links keep working
    { path: '/project-detail/:id', redirect: to => `/work/${to.params.id}` },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: to.path === from.path ? 'smooth' : 'auto' }
    return { top: 0 }
  },
})

export default router
