import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
Vue.use(VueRouter)

const routes = [
  //重定向
  { path: '/', redirect: '/Login' },
  { path: '/Login', component: Login },
  {
    path: '/Home', component: Home, redirect: '/Welcome',
    children: [
      { path: '/Welcome', component: Welcome },
      {path:'/users',component:Users},
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
  if (to.path === '/Login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/Login')
  next();
})

export default router
