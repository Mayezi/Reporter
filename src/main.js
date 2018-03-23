import Vue from 'vue'
import App from './App'
import router from './router'
import iView from 'iview'
import 'iview/dist/styles/iview.css'

Vue.use(iView)

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    if(to.meta.noRequireAuth){
      next()
    }else if(localStorage.user){
      next()
    }else{
      next('/login')
    }
})
router.afterEach((to) => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
})
new Vue({
  el: '#app',
  router: router,
  template: '<App/>',
  components: { App }
})
