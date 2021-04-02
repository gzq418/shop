import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Right from '../components/power/right.vue'
import Role from '../components/power/role.vue'
import Cate from '../components/goods/Cate.vue'
Vue.use(VueRouter)

const routes = [
  //重定向
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home', component: Home, redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      {path:'/users',component:Users},
      {path:'/rights',component:Right},
      {path:'/roles',component:Role},
      {path:'/categories',component:Cate}
    ]
  }


]

const router = new VueRouter({
  routes
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to将要访问的路径
  //from从哪里来
  //next是一个函数，表示放行 
  if (to.path === '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login')
  next();
})

export default router
