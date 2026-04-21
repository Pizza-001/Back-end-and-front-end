import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Index.vue'),
    meta: { title: '宠物医院管理系统 - 登录' }
  },
  {
    path: '/layout',
    name: 'Layout',
    component: () => import('../views/layout/Index.vue'),
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('../views/home/Index.vue'),
        meta: { title: '首页仪表盘' }
      },
      {
        path: '/biz/doctor',
        name: 'Doctor',
        component: () => import('../views/biz/doctor/Index.vue'),
        meta: { title: '医生管理' }
      },
      {
        path: '/biz/banner',
        name: 'Banner',
        component: () => import('../views/biz/banner/Index.vue'),
        meta: { title: '轮播图管理' }
      },
      {
        path: '/biz/article',
        name: 'Article',
        component: () => import('../views/biz/article/Index.vue'),
        meta: { title: '养宠知识管理' }
      },
      {
        path: '/biz/vaccine',
        name: 'Vaccine',
        component: () => import('../views/biz/vaccine/Index.vue'),
        meta: { title: '疫苗记录管理' }
      },
      {
        path: '/biz/appointment',
        name: 'Appointment',
        component: () => import('../views/biz/appointment/Index.vue'),
        meta: { title: '预约挂号处理' }
      },
      {
        path: '/biz/pet',
        name: 'Pet',
        component: () => import('../views/biz/pet/Index.vue'),
        meta: { title: '宠物档案管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
