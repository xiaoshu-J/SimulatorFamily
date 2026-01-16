import App from './App'
import { getState, createNewGame, advanceGameTime, mutations, getters } from './store/app-store.js'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'

// 将状态管理挂载到 Vue 原型（在创建任何组件之前）
const store = {
  state: getState(),
  commit: (mutation, payload) => {
    // 简化版的 commit
    if (mutations[mutation]) {
      mutations[mutation](payload)
    } else {
      console.warn(`Mutation ${mutation} not found`)
    }
  },
  dispatch: (action, payload) => {
    // 简化版的 dispatch
    if (action === 'createNewGame') {
      createNewGame(payload)
    } else if (action === 'advanceGameTime') {
      advanceGameTime(payload)
    }
  },
  getters: getters
}

Vue.prototype.$store = store

const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  
  // 创建 store 实例（与 Vue2 版本保持一致）
  const store = {
    state: getState(),
    commit: (mutation, payload) => {
      if (mutations[mutation]) {
        mutations[mutation](payload)
      } else {
        console.warn(`Mutation ${mutation} not found`)
      }
    },
    dispatch: (action, payload) => {
      if (action === 'createNewGame') {
        createNewGame(payload)
      } else if (action === 'advanceGameTime') {
        advanceGameTime(payload)
      }
    },
    getters: getters
  }
  
  // 在 Vue 3 中挂载到全局属性
  app.config.globalProperties.$store = store
  
  return {
    app
  }
}
// #endif