/**
 * memoize the value returned by Promise
 */
const memo = {},
  progressQueues = {}

function memoProcessData(key) {
  return new Promise((resolve, reject) => {
    // if the operation has already been done before, simply resolve with that data and exit
    if (memo.hasOwnProperty(key)) {
      resolve(memo[key])
      return
    }

    if (!progressQueues.hasOwnProperty(key)) {
      // called for a new key, create an entry for it in progressQueues
      progressQueues[key] = [[resolve, reject]]
    } else {
      // called for a key that's still being processed, enqueue it's handlers and exit.
      progressQueues[key].push([resolve, reject])
      return
    }

    processData(key)
      .then((data) => {
        memo[key] = data // memoize the returned data
        // process all the enqueued entries after successful operation
        for (let [resolver] of progressQueues[key]) resolver(data)
      })
      .catch((error) => {
        // process all the enqueued entries after failed operation
        for (let [, rejector] of progressQueues[key]) rejector(error)
      })
      .finally(() => {
        // clean up progressQueues
        delete progressQueues[key]
      })
  })
}
