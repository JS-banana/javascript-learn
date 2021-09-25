/**
 * 发布订阅模式 类
 */
console.log("类 class ======>")

class Emitter {
  constructor() {
    this._event = this._event || {}
  }
  // 注册订阅
  addEventListener(type, fn) {
    const handler = this._event[type]

    if (!handler) {
      this._event[type] = [fn]
    } else {
      handler.push(fn)
    }
  }
  // 卸载订阅
  removeEventListener(type, fn) {
    const handler = this._event[type]

    if (handler && handler.length) {
      this._event[type] = handler.filter((n) => n !== fn)
    }
  }
  // 通知
  emit(type, ...args) {
    const handler = this._event[type]

    if (handler && handler.length) {
      handler.forEach((fn) => fn.apply(this, args))
    }
  }
}

const emitter = new Emitter()

emitter.addEventListener("change", (obj) => console.log(`name is ${obj.name}`))

emitter.addEventListener("change", (obj) => console.log(`age is ${obj.age}`))

const sex = (obj) => console.log(`sex is ${obj.sex}`)

emitter.addEventListener("change", sex)

emitter.emit("change", { name: "xiaoming", age: 28, sex: "male" })

console.log("event-A", emitter._event)

emitter.removeEventListener("change", sex)

console.log("====>>>>")

emitter.emit("change", { name: "xiaoming", age: 28, sex: "male" })

console.log("event-B", emitter._event)

// 输出
// name is xiaoming
// age is 28
// sex is male
// event-A {change: Array(3)}

// ====>>>>

// name is xiaoming
// age is 28
// event-B {change: Array(2)}
