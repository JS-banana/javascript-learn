/**
 * 发布订阅模式
 */
console.log("函数对象 sub-pub ======>")

// 订阅中心
const subscribers = {}
// 订阅
const subscribe = (type, fn) => {
  if (!subscribers[type]) subscribers[type] = []
  subscribers[type].push(fn)
}
// 发布
const publish = (type, ...args) => {
  if (!subscribers[type] || !subscribers[type].length) return
  subscribers[type].forEach((fn) => fn(...args))
}
// 取消订阅
const unsubscribe = (type, fn) => {
  if (!subscribers[type] || !subscribers[type].length) return
  subscribers[type] = subscribers[type].filter((n) => n !== fn)
}

// 订阅者
subscribe("topic-1", () => console.log("suber-A 订阅了 topic-1"))
subscribe("topic-2", () => console.log("suber-B 订阅了 topic-2"))
subscribe("topic-1", () => console.log("suber-C 订阅了 topic-1"))

// 发布者
publish("topic-1") // 通知订阅了 topic-1 的 A 和 B

// 输出结果
// suber-A 订阅了 topic-1
// suber-C 订阅了 topic-1
