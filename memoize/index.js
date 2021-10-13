/**
 * 缓存
 * https://stackfull.dev/memoizing-async-functions-in-javascript
 */

// 1. getSquare 函数

// function getSquare(x) {
//   return x * x
// }

// 2. 添加 memoize
const memo = {}

function getSquare(x) {
  if (memo.hasOwnProperty(x)) {
    console.log("yes")
    return memo[x]
  }
  console.log("no")

  memo[x] = x * x

  return memo[x]
}

getSquare(2)
console.log("memo", memo)
//

setTimeout(() => {
  getSquare(2)
  console.log("memo", memo)
}, 2000)

// 输出日志
// no
// memo { '2': 4 }
// yes
// memo { '2': 4 }
