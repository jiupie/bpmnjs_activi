import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/basic',
    name: 'Basic',
    alias: '/',
    component: () => import('../views/Basic.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
