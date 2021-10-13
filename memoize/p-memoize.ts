/**
 * https://github.com/sindresorhus/p-memoize/blob/main/index.ts
 */

import mimicFn from "mimic-fn"
import type { AsyncReturnType } from "type-fest"

// TODO: Use the one in `type-fest` when it's added there.
type AnyAsyncFunction = (...arguments_: readonly any[]) => Promise<unknown | void>

const cacheStore = new WeakMap<AnyAsyncFunction, CacheStorage<any, any>>()
const promiseCacheStore = new WeakMap<AnyAsyncFunction, Map<unknown, unknown>>()

interface CacheStorage<KeyType, ValueType> {
  has: (key: KeyType) => Promise<boolean> | boolean
  get: (key: KeyType) => Promise<ValueType | undefined> | ValueType | undefined
  set: (key: KeyType, value: ValueType) => void
  delete: (key: KeyType) => void
  clear?: () => void
}

interface Options<FunctionToMemoize extends AnyAsyncFunction, CacheKeyType> {
  /**
	Cache rejected promises.

	@default false
	*/
  readonly cachePromiseRejection?: boolean

  /**
	Determines the cache key for storing the result based on the function arguments. By default, __only the first argument is considered__ and it only works with [primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

	A `cacheKey` function can return any type supported by `Map` (or whatever structure you use in the `cache` option).

	You can have it cache **all** the arguments by value with `JSON.stringify`, if they are compatible:

	```
	import pMemoize from 'p-memoize';

	pMemoize(function_, {cacheKey: JSON.stringify});
	```

	Or you can use a more full-featured serializer like [serialize-javascript](https://github.com/yahoo/serialize-javascript) to add support for `RegExp`, `Date` and so on.

	```
	import pMemoize from 'p-memoize';
	import serializeJavascript from 'serialize-javascript';

	pMemoize(function_, {cacheKey: serializeJavascript});
	```

	@default arguments_ => arguments_[0]
	@example arguments_ => JSON.stringify(arguments_)
	*/
  readonly cacheKey?: (arguments_: Parameters<FunctionToMemoize>) => CacheKeyType

  /**
	Use a different cache storage. Must implement the following methods: `.has(key)`, `.get(key)`, `.set(key, value)`, `.delete(key)`, and optionally `.clear()`. You could for example use a `WeakMap` instead or [`quick-lru`](https://github.com/sindresorhus/quick-lru) for a LRU cache.

	@default new Map()
	@example new WeakMap()
	*/
  readonly cache?: CacheStorage<CacheKeyType, AsyncReturnType<FunctionToMemoize>>
}

/**
[Memoize](https://en.wikipedia.org/wiki/Memoization) functions - An optimization used to speed up consecutive function calls by caching the result of calls with identical input.

@param fn - Function to be memoized.

@example
```
import {setTimeout as delay} from 'node:timer/promises';
import pMemoize from 'p-memoize';
import got from 'got';

const memoizedGot = pMemoize(got);

await memoizedGot('https://sindresorhus.com');

// This call is cached
await memoizedGot('https://sindresorhus.com');

await delay(2000);

// This call is not cached as the cache has expired
await memoizedGot('https://sindresorhus.com');
```
*/
export default function pMemoize<FunctionToMemoize extends AnyAsyncFunction, CacheKeyType>(
  fn: FunctionToMemoize,
  {
    cachePromiseRejection = false,
    cacheKey,
    cache = new Map<CacheKeyType, AsyncReturnType<FunctionToMemoize>>(),
  }: Options<FunctionToMemoize, CacheKeyType> = {}
): FunctionToMemoize {
  // Promise objects can't be serialized so we keep track of them internally and only provide their resolved values to `cache`
  // `Promise<AsyncReturnType<FunctionToMemoize>>` is used instead of `ReturnType<FunctionToMemoize>` because promise properties are not kept
  const promiseCache = new Map<CacheKeyType, Promise<AsyncReturnType<FunctionToMemoize>>>()

  const memoized = async function (
    this: any,
    ...arguments_: Parameters<FunctionToMemoize>
  ): Promise<AsyncReturnType<FunctionToMemoize>> {
    const key = cacheKey ? cacheKey(arguments_) : (arguments_[0] as CacheKeyType)

    if (promiseCache.has(key)) {
      return promiseCache.get(key)!
    }

    if (await cache.has(key)) {
      return (await cache.get(key))!
    }

    const promise = fn.apply(this, arguments_) as Promise<AsyncReturnType<FunctionToMemoize>>

    promiseCache.set(key, promise)

    try {
      const result = await promise

      cache.set(key, result)

      return result
    } catch (error: unknown) {
      if (!cachePromiseRejection) {
        promiseCache.delete(key)
      }

      throw error as Error
    }
  } as FunctionToMemoize

  mimicFn(memoized, fn, {
    ignoreNonConfigurable: true,
  })

  cacheStore.set(memoized, cache)
  promiseCacheStore.set(memoized, promiseCache)

  return memoized
}
