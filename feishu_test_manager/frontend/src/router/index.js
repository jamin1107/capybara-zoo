import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '工作台' }
  },
  {
    path: '/cases',
    name: 'Cases',
    component: () => import('../views/Cases.vue'),
    meta: { title: '用例库' }
  },
  {
    path: '/cases/:id',
    name: 'CaseDetail',
    component: () => import('../views/CaseDetail.vue'),
    meta: { title: '用例详情' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/Tasks.vue'),
    meta: { title: '测试任务' }
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: () => import('../views/TaskDetail.vue'),
    meta: { title: '任务详情' }
  },
  {
    path: '/execute/:taskId',
    name: 'Execute',
    component: () => import('../views/Execute.vue'),
    meta: { title: '用例执行' }
  },
  {
    path: '/bugs',
    name: 'Bugs',
    component: () => import('../views/Bugs.vue'),
    meta: { title: '缺陷管理' }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports.vue'),
    meta: { title: '测试报告' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 飞书测试管理` : '飞书测试管理'
  next()
})

export default router