import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import {router} from './router'

Vue.config.productionTip = false

Vue.use(VueRouter)


new Vue({
  el: '#app',
  router,
  // components: {App},
  render: h => h(App),
})
// .$mount('#app')
