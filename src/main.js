import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import ZkTable from 'vue-table-with-tree-grid'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 在最后必须返回config
  return config;
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.component('tree-table', ZkTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
