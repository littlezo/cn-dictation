import VueRouter from 'vue-router'
import Vue from 'vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/homeCenter'
  },
  {
    path: '/homeCenter',
    name:'HomeCenter',
    component: () => import('../components/HomeCenter.vue')
  },
  {
    path: '/onDictation',
    name:'OnDictation',
    component: () => import('../components/OnDictation.vue')
  },
  {
    path: '/showResult',
    name:'ShowResult',
    component: () => import('../components/ShowResult.vue')
  }
]

const router = new VueRouter({
  routes
})

// 输出router
export default router;