import Vue from 'vue'
import iView from 'iview'
import Router from 'vue-router'
import Main from '@/components/Main'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/report/download',
      name: 'export',
      meta: {
        noRequireAuth: true,  // 添加该字段，表示进入这个路由不需要登录
      }
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        noRequireAuth: true,  // 添加该字段，表示进入这个路由不需要登录
      },
      component: resolve => { require(['@/components/Login.vue'], resolve) }
    },
    {
      path: '/',
      name: 'main',
      component: Main,
      redirect: '/dailyreport',
      children: [
        { path: 'dailyreport', name: 'dailyreport', component: resolve => { require(['@/components/Dailyreport.vue'], resolve) } },
        { path: 'weekreport', name: 'weekreport', component: resolve => { require(['@/components/Weekreport.vue'], resolve) } },
        { path: 'monthreport', name: 'monthreport', component: resolve => { require(['@/components/Monthreport.vue'], resolve) } },
        { path: 'teamdailyreport', name: 'teamdailyreport', component: resolve => { require(['@/components/group/dailyreport.vue'], resolve) } },
        { path: 'changepw', name: 'changepw', component: resolve => { require(['@/components/Changepw.vue'], resolve) } }      ]
    },
    {
      path: '/about',
      name: 'About',
      component: resolve => { require(['@/components/About.vue'], resolve) }
    },
    {
      path: '/500',
      meta: {
        noRequireAuth: true,  // 添加该字段，表示进入这个路由不需要登录
      },
      component: resolve => { require(['@/components/500.vue'], resolve) }
    },
    {
      path: '/*',
      meta: {
        noRequireAuth: true,  // 添加该字段，表示进入这个路由不需要登录
      },
      component: resolve => { require(['@/components/404.vue'], resolve) }
    }
  ]
  // ],
  // mode: 'history'
})
