// // 测试 promise.all 的运行顺序
const reuqest01 = () =>
  new Promise((resolve) =>
    setTimeout(() => {
      console.log("reuqest01: 3000ms")
      resolve(true)
    }, 3000)
  )

const reuqest02 = () =>
  new Promise((resolve) =>
    setTimeout(() => {
      console.log("reuqest02: 1000ms")
      resolve(true)
    }, 3000)
  )

const reuqest03 = () =>
  new Promise((resolve) =>
    setTimeout(() => {
      console.log("reuqest03: 2000ms")
      resolve(true)
    }, 3000)
  )

// const reuqest04 = async () => await delay(4000, "reuqest04: 4000ms", false) // 异常

// const requstList = [reuqest01, reuqest02, reuqest03 /*, reuqest04()*/]

// requstList.reduce((prev, next) => prev.then(() => next()), Promise.resolve())

// 模拟异步
// const delay = (time, arg, status = true) =>
//   new Promise((resolve, reject) =>
//     setTimeout(() => {
//       console.log(arg)
//       status ? resolve(arg) : reject(`err：`, arg)
//     }, time)
//   )

// // 测试 promise.all 的运行顺序
// const reuqest01 = async () => await delay(3000, "reuqest01: 3000ms")
// const reuqest02 = async () => await delay(1000, "reuqest02: 1000ms")
// const reuqest03 = async () => {
//   await delay(2000, "reuqest03: 2000ms")
//   console.log("promise.all.then:", res)
// }

// const requstList = [reuqest01, reuqest02, reuqest03]
// console.time("time-used:")
// requstList.reduce((prev, next) => prev.then(() => next()), Promise.resolve())

const p1 = new Promise((resolve, reject) =>
  setTimeout(() => {
    console.log("reuqest01: 3000ms")
    resolve("one")
  }, 3000)
)

const p2 = new Promise((resolve, reject) => {
  setTimeout(resolve, 1000, "two")
  console.log("reuqest02: 1000ms")
})
const p3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 1000, "three")
  console.log("reuqest03: 1000ms")
})
const p4 = new Promise((resolve, reject) => {
  setTimeout(resolve, 4000, "four")
})
//   const p5 = new Promise((resolve, reject) => {
//     reject('reject');
//   });

Promise.all([p1, p2, p3, p4]).then(
  (values) => {
    console.log(values)
  },
  (reason) => {
    console.log(reason)
  }
)
