/**
 * 发布订阅模式 vue.$event
 */
function toArray(list, start) {
  start = start || 0
  let i = list.length - start
  const ret = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

class Vue {
  constructor() {
    this._events = {}
  }
  get event() {
    return this._events
  }
}

// $on
Vue.prototype.$on = function (event, fn) {
  const vm = this
  // 如果传入的 event 监听事件类型为数组，递归调用 $on 方法
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      vm.$on(event[i], fn)
    }
  } else {
    // 如果存在直接添加，不存在新建后添加
    ;(vm._events[event] || (vm._events[event] = [])).push(fn)
  }
  // 返回实例，用于链式调用
  return vm
}

// $once
Vue.prototype.$once = function (event, fn) {
  const vm = this
  // 当该 event 事件触发时，调用 on 方法
  function on() {
    // 首先执行 $off 方法卸载 本回调方法
    vm.$off(event, on)
    // 再执行 本回调方法
    fn.apply(vm, arguments)
  }
  // 该赋值会在 $off 中使用：cb.fn === fn
  // 因为该 $once 方法调用的是 $on 添加回调，但是添加的是包装后的 on 方法而不是 fn 方法
  // 因此当我们单独调用 $off方法删除 fn 回调时，是找不到的，这时就可以通过 cb.fn === fn 判断
  on.fn = fn
  // 调用 $on 方法，把该回调添加到队列
  vm.$on(event, on)
  return vm
}

// $off
Vue.prototype.$off = function (event, fn) {
  const vm = this

  // 如果不传入任何参数，清空所有的事件
  if (!arguments.length) {
    vm._events = Object.create(null)
    return vm
  }

  // 如果 event 为数组，同 $on 逻辑，递归卸载事件
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      vm.$off(event[i], fn)
    }
    return vm
  }

  // 回调列表
  const cbs = vm._events[event]

  // 如果该 event 事件不存在绑定回调，不处理
  if (!cbs) {
    return vm
  }

  // 如果未传入对应 event 的解绑回调，则清空该 event 的所有
  if (!fn) {
    vm._events[event] = null
    return vm
  }

  // event 事件类型和 回调 都存在，遍历查找删除 指定 回调
  let cb
  let i = cbs.length
  while (i--) {
    cb = cbs[i]
    if (cb === fn || cb.fn === fn) {
      cbs.splice(i, 1)
      break
    }
  }
  return vm
}

// $emit
Vue.prototype.$emit = function (event) {
  const vm = this

  // 回调列表
  let cbs = vm._events[event]

  // 判断该 event 是否存在执行回调
  if (cbs) {
    // $emit方法可以传参，这些参数会在调用回调函数的时候传进去
    // 排除 event 参数的其他参数
    // toArray 是一个把类数组转换为数组的方法
    const args = toArray(arguments, 1)

    // 遍历回调函数
    for (let i = 0, l = cbs.length; i < l; i++) {
      cbs[i].apply(vm, args)
    }
  }
  return vm
}

// ======>
const myVue = new Vue()

const update_user = (args) => console.log("user：", args)
const once_update_user = (args) => console.log("once_user：", args)

myVue.$on("user", update_user)
myVue.$once("user", once_update_user)

console.log("before evnts：", myVue.event)

myVue.$emit("user", { name: "xiaoming", age: 18 })

myVue.$off("user", update_user)

console.log("after evnts：", myVue.event)
