/**
 * vue 双向数据绑定实现
 * https://juejin.cn/post/6844903698154389517
 */
const getData = (data, vm) => data.call(vm, vm)

//  初始化 `initData`
function initData(vm) {
  //
  let data = vm.$options.data
  data = vm._data = typeof data === "function" ? getData(data, vm) : data || {}
  console.log("vm._data", vm._data)
  //
  observe(data, true /* asRootData */)
}

//  创建观察者 `observe`
function observe(value, asRootData) {
  let ob
  // Observer
  ob = new Observer(value)
  // asRootData = true
  if (asRootData && ob) {
    ob.vmCount++
  }
  //
  return ob
}

//   观察者类 `Observer`
class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    if (Array.isArray(value)) {
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  // 处理所有属性
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  // 数组 时遍历处理
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      // 如果 watcher 存在，触发依赖收集
      if (Dep.target) {
        dep.depend()
      }

      return val
    },
    set: function reactiveSetter(newVal) {
      // ...
      // 数据变更 ==> 触发set方法 ==> 调用dep.notify()通知更新
      dep.notify()
    },
  })
}

// 被观察列表类 `Dep`
let uid = 0
class Dep {
  constructor() {
    this.id = uid++
    this.subs = []
  }

  addSub(sub) {
    // sub ===> Watcher
    // 该方法会在 watcher 添加订阅时被执行
    this.subs.push(sub)
  }

  removeSub(sub) {
    // sub ===> Watcher
    remove(this.subs, sub)
  }

  // Dep.target===watcher 即 watcher.addDep
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify() {
    // subs
    const subs = this.subs.slice()
    // 调用 watcher 的 update
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
// 存放唯一 watcher
Dep.target = null
const targetStack = []

export function pushTarget(target) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm
    vm._watchers.push(this)

    this.cb = cb
    this.deps = []
    this.newDeps = []
    this.value = this.get()
    this.getter = expOrFn
  }

  /**
   * 获取最新 value， 收集依赖
   */
  get() {
    pushTarget(this)

    let value
    const vm = this.vm
    value = this.getter.call(vm, vm)

    if (this.deep) {
      // 收集嵌套属性的每个依赖
      traverse(value)
    }

    popTarget()
    this.cleanupDeps()

    return value
  }

  // 添加依赖
  // dep === class Dep
  addDep(dep) {
    this.newDeps.push(dep)
    dep.addSub(this)
  }

  // 清除依赖
  cleanupDeps() {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      dep.removeSub(this)
    }
    this.deps = this.newDeps
  }

  // 提供更新的接口
  update() {
    this.run()
  }

  // 通知执行更新
  run() {
    const value = this.get()
    this.cb.call(this.vm, value, oldValue)
  }

  // 通过 watcher 收集所有依赖
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
}

// class Vue {
//   constructor($options) {
//     this.$options = $options
//     this._data = {}
//   }
//   get instance() {
//     return this._data
//   }
// }

// Vue.prototype._init = function () {
//   const vm = this

//   initData(vm)
// }

// const myVue = new Vue({
//   data() {
//     return {
//       name: "xiaoming",
//       age: 16,
//     }
//   },
// })

// myVue._init()
// console.log("instance", myVue)
