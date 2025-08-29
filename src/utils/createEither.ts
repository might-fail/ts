import { AnyEither, EitherMode } from "./utils.type"
import type { Either as StandardEither } from "../Either"
import type { Either as GoEither } from "../go/Either"

// This is not how we intended the tuple feature to work but this is the only way we could currently get TypeScript to play nice
// this really should just be an interator on the either object, but it's much more complicated because of TS.
// All the details are in this PR https://github.com/might-fail/ts/pull/7#issuecomment-2395122593
// hopefully we can change this with a future version of TS.

export const createEither = <T, E extends Error = Error, TEitherMode extends EitherMode = "standard">(
  {
    result,
    error
  }:
    | {
        error: E
        result: undefined
      }
    | {
        error: undefined
        result: T
      },
  eitherMode: EitherMode = "standard"
): TEitherMode extends "standard"
  ? StandardEither<T, E>
  : TEitherMode extends "go"
    ? GoEither<T, E>
    : AnyEither<T, E> => {
  if (error) {
    const array = eitherMode === "standard" ? [error, undefined] : [undefined, error]
    const obj = {} as any
    obj.error = error
    obj.result = undefined
    return createArrayProxy<T, E>(obj, array)
  }
  const array = eitherMode === "standard" ? [undefined, result] : [result, undefined]
  const obj = {} as any
  obj.error = undefined
  obj.result = result
  return createArrayProxy<T, E>(obj, array)
}

const createArrayProxy = <T, E extends Error = Error>(obj: any, array: (undefined | Error | T)[]) => {
  // Proxy to intercept array methods and properties
  return new Proxy(obj, {
    get(target, prop, receiver) {
      // If the property exists on the object itself, return it
      if (prop in target) {
        return Reflect.get(target, prop, receiver)
      }

      // If the property exists on the internal array, proxy it
      if (prop in array) {
        const value = (array as any)[prop] // TypeScript array typing here
        if (typeof value === "function") {
          // Proxy array methods
          return function (...args: any[]) {
            return value.apply(array, args)
          }
        } else {
          // Return array properties (like length)
          return value
        }
      }

      // Handle the iterator separately
      if (prop === Symbol.iterator) {
        const originalIterator = array[Symbol.iterator]()
        return function* () {
          for (let item of originalIterator) {
            yield item
          }
        }
      }

      return undefined
    }
  })
}
