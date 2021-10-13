/**
 * memoizeAsync
 */

// 1. 异步回调函数
expensiveOperation(key, (data) => {
  // Do something
})

// 2. 添加 memoize
// const memo = {}

// function memoExpensiveOperation(key, callback) {
//   if (memo.hasOwnProperty(key)) {
//     callback(memo[key])
//     return
//   }

//   expensiveOperation(key, (data) => {
//     memo[key] = data
//     callback(data)
//   })
// }

// 注意：
// 多次执行时，第一次的结果可能还未返回，最后的结果会覆盖之前的

// 3. 优化后写法

const memo = {} // 只缓存最后一次执行结果
const progressQueues = {} // 运行队列

function memoExpensiveOperation(key, callback) {
  if (memo.hasOwnProperty(key)) {
    callback(memo[key])
    return
  }

  if (!progressQueues.hasOwnProperty(key)) {
    // processing new key, create an entry for it in progressQueues
    progressQueues[key] = [callback]
  } else {
    // processing a key that's already being processed, enqueue it's callback and exit.
    progressQueues[key].push(callback)
    return
  }

  expensiveOperation(key, (data) => {
    // memoize result
    memo[key] = data
    // process all the enqueued items after it's done
    for (let callback of progressQueues[key]) {
      callback(data)
    }
    // clean up progressQueues
    delete progressQueue[key]
  })
}

// 4. 封装 memoize

function memoizeAsync(fn, getKey) {
  const memo = {}
  const progressQueues = {}

  return function memoized(...allArgs) {
    const callback = allArgs[allArgs.length - 1]
    const args = allArgs.slice(0, -1)
    const key = getKey(...args)

    if (memo.hasOwnProperty(key)) {
      callback(key)
      return
    }

    if (!progressQueues.hasOwnProperty(key)) {
      // processing new key, create an entry for it in progressQueues
      progressQueues[key] = [callback]
    } else {
      // processing a key that's already being processed, enqueue it's callback and exit.
      progressQueues[key].push(callback)
      return
    }

    fn.call(this, ...args, (data) => {
      // memoize result
      memo[key] = data
      // process all the enqueued items after it's done
      for (let callback of progressQueues[key]) {
        callback(data)
      }
      // clean up progressQueues
      delete progressQueue[key]
    })
  }
}

// USAGE

// const memoExpensiveOperation = memoizeAsync(expensiveOperation, (key) => key)
