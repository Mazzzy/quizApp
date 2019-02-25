import Vue from 'vue'
import Router from 'vue-router'
import Register from './components/Register.vue'
import Home from './components/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    
  ]
})