/**
 * promise.all 方法串行运行
 * 文章阅读和分析
 * https://github.com/ascoders/weekly/blob/master/%E5%89%8D%E6%B2%BF%E6%8A%80%E6%9C%AF/77.%E7%B2%BE%E8%AF%BB%E3%80%8A%E7%94%A8%20Reduce%20%E5%AE%9E%E7%8E%B0%20Promise%20%E4%B8%B2%E8%A1%8C%E6%89%A7%E8%A1%8C%E3%80%8B.md
 */

// 模拟异步
const delay = (time, arg, status = true) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      console.log(arg)
      status ? resolve(arg) : reject(`err：`, arg)
    }, time)
  )

// 测试 promise.all 的运行顺序
const reuqest01 = async () => await delay(3000, "reuqest01: 3000ms")
const reuqest02 = async () => await delay(1000, "reuqest02: 1000ms")
const reuqest03 = async () => await delay(2000, "reuqest03: 2000ms")

const reuqest04 = async () => await delay(4000, "reuqest04: 4000ms", false)

// ✅ 基本使用 -------------------

// const requstList = [reuqest01(), reuqest02(), reuqest03(), reuqest04()]

// console.time("time-used:")

// Promise.all(requstList)
//   .then((res) => {
//     console.log("promise.all.then:", res)
//     console.timeEnd("time-used:")
//   })
//   .catch((err) => {
//     console.log("promise.all.catch:", err)
//   })

// 输出日志

// reuqest02: 1000ms
// reuqest03: 2000ms
// reuqest01: 3000ms

// promise.all.then: ['reuqest01: 3000ms', 'reuqest02: 1000ms', 'reuqest03: 2000ms']

// 结论：
// 1. Promise.all 是并行执行其接受到的 promise 队列
// 2. 函数执行结果的响应先后不影响队列的排列
// 3. 即使只有一个失败，也会返回整个失败，检测到失败立即判定为失败

// ✅ 同步执行写法 -------------------
//  1. async await 写法

const fetchPromise = async () => {
  try {
    const res01 = await reuqest01()

    const res02 = await reuqest02()

    const res03 = await reuqest03()

    console.log("sucess:", [res01, res02, res03])

    const res04 = await reuqest04()

    console.log("fail:", [res01, res02, res03, res04])
  } catch (error) {
    console.log(error)
  }
}

// fetchPromise()

// 这种方式比较繁琐，且需要try catch配合处理 err异常问题
// res04 异常后下面代码 console.log("fail:") 将不会执行，会直接进入 catch
// a. 需要对两种状态进行处理，
// b. 当前promise函数执行异常后，就不会继续往下执行，直接进入 catch

// 2. reduce
const requstList = [reuqest01, reuqest02, reuqest03]

// requstList.reduce((prev, next) => prev.then(() => next()), Promise.resolve())

// 依赖上一个返回值

requstList.reduce(async (prev, next) => {
  const prevResult = await prev

  if (prevResult) {
    const res = await next()
    console.log("res:", res)
    return true
  }
  console.log("err")
  return false
}, Promise.resolve(true))

// 输出日志
// reuqest01: 3000ms
// reuqest02: 1000ms
// reuqest03: 3000ms

// a. promise函数是在执行时调用，和 Prommise.all 写法有所区别
// b. reduce 初始默认值指定 Promise.resolve() 状态，确保开始执行 .then 的执行

// 写法分析
// 手动串行写法
// Reduce 是同步执行的，在一个事件循环就会完成,但这仅仅是在内存快速构造了 Promise 执行队列，展开如下：

new Promise((resolve, reject) => {
  // Promise 1
  resolve()
})
  .then((res) => {
    // Promise 2
    return res
  })
  .then((res) => {
    // Promise 3
    return res
  })

// Reduce 的作用就是在内存中生成这个队列，而不需要把这个冗余的队列写在代码里！

//  3. async await for循环写法

// async function runPromiseList(promiseList) {
//   for (const request of promiseList) {
//     try {
//       const res = await request()
//       console.log("res", res)
//     } catch (error) {
//       console.log("error:", error)
//     }
//   }
// }

// runPromiseList(requstList)
