import { useReducer, useLayoutEffect, useRef } from "react"

// 是否为非浏览器环境
const isSSR =
  typeof window === "undefined" ||
  !window.navigator ||
  /ServerSideRendering|^Deno\//.test(window.navigator.userAgent)

// useEffect 可以在服务端（NodeJs）执行，而 useLayoutEffect 不行
const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect

export default function create(createState) {
  const api = typeof createState === "function" ? createImpl(createState) : createState

  // 返回 useStore 函数供外部使用
  // 闭包使得 api 作为执行上下文，供 useStore 内部使用，保证数据隔离
  const useStore = (selector, equalityFn = Object.is) => {
    // 用于触发组件更新
    const [, forceUpdate] = useReducer((c) => c + 1, 0)

    // 获取 state
    const state = api.getState()
    // 把 state 挂载到 useRef，避免副作用对其进行影响而更新
    const stateRef = useRef(state)
    // 挂载指定 selector 方法到 useRef
    // 列如：const bears = useStore(state => state.bears)
    const selectorRef = useRef(selector)
    // 等值方法
    const equalityFnRef = useRef(equalityFn)
    //
    const erroredRef = useRef(false)

    // 当前 state 属性（state.bears）
    const currentSliceRef = useRef()
    // 空值处理
    if (currentSliceRef.current === undefined) {
      currentSliceRef.current = selector(state)
    }

    let newStateSlice
    let hasNewStateSlice = false

    // The selector or equalityFn need to be called during the render phase if
    // they change. We also want legitimate errors to be visible so we re-run
    // them if they errored in the subscriber.
    if (
      stateRef.current !== state ||
      selectorRef.current !== selector ||
      equalityFnRef.current !== equalityFn ||
      erroredRef.current
    ) {
      // Using local variables to avoid mutations in the render phase.
      newStateSlice = selector(state)
      // 新旧值是否相等
      hasNewStateSlice = !equalityFn(currentSliceRef.current, newStateSlice)
    }

    // Syncing changes in useEffect.
    useIsomorphicLayoutEffect(() => {
      if (hasNewStateSlice) {
        currentSliceRef.current = newStateSlice
      }
      stateRef.current = state
      selectorRef.current = selector
      equalityFnRef.current = equalityFn
      erroredRef.current = false
    })

    // 暂存 state
    const stateBeforeSubscriptionRef = useRef(state)
    // 初始化
    useIsomorphicLayoutEffect(() => {
      const listener = () => {
        try {
          // 触发更新时的最新获取 state
          const nextState = api.getState()
          // 注入 nextState 执行传入的 selector 方法，获取值，即 state.bears
          const nextStateSlice = selectorRef.current(nextState)
          // 对比不相等 ==> 更新
          if (!equalityFnRef.current(currentSliceRef.current, nextStateSlice)) {
            // 更新 stateRef 为最新 state
            stateRef.current = nextState
            // 更新 currentSliceRef 为最新属性值，即 state.bears
            currentSliceRef.current = nextStateSlice
            // 更新组件
            forceUpdate()
          }
        } catch (error) {
          // 登记错误
          erroredRef.current = true
          // 更新组件
          forceUpdate()
        }
      }
      // 添加 listener 订阅
      const unsubscribe = api.subscribe(listener)
      // state已经变更，通知更新
      if (api.getState() !== stateBeforeSubscriptionRef.current) {
        listener() // state has changed before subscription
      }
      // 卸载时 清除订阅
      return unsubscribe
    }, [])

    return hasNewStateSlice ? newStateSlice : currentSliceRef.current
  }

  // 合并 api 属性到 useStore
  Object.assign(useStore, api)

  return useStore
}

/**
 * createImpl
 */
function createImpl(createState) {
  // 用于缓存上一次的 状态
  let state
  // 监听队列
  const listeners = new Set()

  const setState = (partial, replace) => {
    // 如果是 function 注入 state 并获取执行结果，否则直接取值
    // 例如：setCount: ()=> set(state=> ({state: state.count +1 })
    // 例如：setCount: ()=> set({count: 10})
    const nextState = typeof partial === "function" ? partial(state) : partial
    // 优化：判断状态是否变化了，再更新组件状态
    if (nextState !== state) {
      // 上一次状态
      const previousState = state
      // 当前状态最新状态
      state = replace ? nextState : Object.assign({}, state, nextState)
      // 通知队列中的每一个组件
      listeners.forEach((listener) => listener(state, previousState))
    }
  }

  // 函数获取 state
  const getState = () => state

  // 存在 selector 或 equalityFn 参数时，对订阅方法进行处理
  const subscribeWithSelector = (listener, selector = getState, equalityFn = Object.is) => {
    // 当前拿到的值
    let currentSlice = selector(state)
    // 实际添加到队列的是 listenerToAdd 方法，
    function listenerToAdd() {
      // 订阅通知执行时的值，即 下一次更新的值
      const nextSlice = selector(state)
      // 对比前后值不相等，则触发更新通知
      if (!equalityFn(currentSlice, nextSlice)) {
        // 上一次值
        const previousSlice = currentSlice
        // 执行添加的订阅函数
        // 例如：useStore.subscribe(console.log, state => state.paw)
        // 中的 console.log
        listener((currentSlice = nextSlice), previousSlice)
      }
    }
    // add listenerToAdd
    listeners.add(listenerToAdd)
    // Unsubscribe
    return () => listeners.delete(listenerToAdd)
  }

  // 添加订阅
  // 列如：useStore.subscribe(console.log, state => state.paw)
  // 效果：只监听 paw 的变化，通知更新
  const subscribe = (listener, selector, equalityFn) => {
    // selector 或 equalityFn 参数存在，走该逻辑，添加指定的订阅通知
    if (selector || equalityFn) {
      return subscribeWithSelector(listener, selector, equalityFn)
    }
    // 否则 对所有变更添加订阅通知
    listeners.add(listener)
    // Unsubscribe
    // 执行结果为删除该订阅者函数
    // 即：const unsubscribe= subscribe() = () => listeners.delete(listener)
    return () => listeners.delete(listener)
  }

  // 清除 订阅
  const destroy = () => listeners.clear()
  // 返回给 create 方法的处理结果，即返回了 4 个处理方法
  const api = { setState, getState, subscribe, destroy }
  // 其对传入的 createState 函数注入了3个参数 setState, getState, api
  // 使得在 create 创建 store时，可以在回调函数的参数里取用方法对数据进行处理
  // 如：create(set=> ({count: 0,setCount: ()=> set(state=> ({state: state.count +1 }))}))
  // 并调用然后返回 api = { setState, getState, subscribe, destroy } 属性方法
  state = createState(setState, getState, api)

  return api
}
