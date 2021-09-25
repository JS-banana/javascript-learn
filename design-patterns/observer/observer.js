/**
 * 观察者模式
 */

// 观察者列表
const observers = []

// 添加
const addob = (ober) => {
  observers.push(ober)
}

// 通知
const notify = (...args) => {
  observers.forEach((fn) => fn(args))
}

// 测试 =======>
const subA = () => console.log("I am sub A")
const subB = (args) => console.log("I am sub B", args)

addob(subA)
addob(subB)
notify({ name: "sss", site: "ssscode.com" })
// I am sub A
// I am sub B [{name: "sss", site: "ssscode.com"}]
