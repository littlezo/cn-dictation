import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import router from "./router"

import 'element-ui/lib/theme-chalk/index.css' // 引入样式
Vue.use(ElementUI) // 全局使用

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
