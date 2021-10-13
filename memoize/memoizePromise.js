/**
 * memoizePromise
 */

// 用例
expensiveOperation(args).then((values) => {
  // Do something
})
const memoExpensiveOperation = memoizeAsync(expensiveOperation, (key) => key)

// memoize
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

  expensiveOperation(key).then((data) => {
    memo[key] = data
    // process all the enqueued items after it's done
    for (let callback of progressQueues[key]) {
      callback(data)
    }
    // clean up progressQueues
    delete progressQueue[key]
  })
}
