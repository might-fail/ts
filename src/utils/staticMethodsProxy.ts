import { EitherMode, MightFailFunction } from "./utils.type.js"

export const makeProxyHandler = <TMightFailFunction extends MightFailFunction<EitherMode>>(
  mightFailFunction: TMightFailFunction
) => ({
  get(_: TMightFailFunction, property: string) {
    if (Object.getOwnPropertyDescriptor(Promise, property) === undefined) {
      return mightFailFunction(Promise.reject(new Error(`property ${property} not found on Promise`)))
    }

    const value = (Promise as any)[property]

    if (typeof value !== "function") {
      return mightFailFunction(Promise.reject(new Error(`property ${property} is not a Promise method`)))
    }

    return function (...args: any[]) {
      const promise = value.apply(Promise, args)
      return mightFailFunction(promise)
    }
  }
})
