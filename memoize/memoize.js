/**
 * memoize
 */

function memoize(fn, getKey) {
  const memo = {}
  return function memoized(...args) {
    console.log(...args)
    const key = getKey(...args)

    console.log("memo", memo)

    if (memo.hasOwnProperty(key)) {
      console.log("yes")
      return memo[key]
    }
    console.log("no")

    console.log(args)
    memo[key] = fn.apply(this, args)

    return memo[key]
  }
}

// test
const getDivision = (a, b) => a / b

const memoGetDivision = memoize(getDivision, (a, b) => `${a}_${b}`)

memoGetDivision(4, 2)

setTimeout(() => {
  memoGetDivision(4, 2)
}, 2000)

// 输出日志

// 4 2
// memo {}
// no
// 4 2
// memo { '4_2': 2 }
// yes
