import standard from "../index.js"
import { type Either } from "./Either.js"
import { createEither } from "../utils/createEither.js"
import { makeProxyHandler } from "../utils/staticMethodsProxy.js"
import { MightFail, MightFailFunction } from "../utils/utils.type.js"
import { mightFailFunction as standardMightFailFunction } from "../utils/mightFailFunction.js"

const mightFailFunction: MightFailFunction<"go"> = async function <T, E extends Error = Error>(promise: T) {
  const { result, error } = await standardMightFailFunction(promise)
  return error
    ? createEither<Awaited<T>, E, "go">({ result: undefined, error: error as E }, "go")
    : createEither<Awaited<T>, E, "go">({ result, error: undefined }, "go")
}

/**
 * Wraps a promise in an Either to safely handle both its resolution and rejection. This function
 * takes a Promise of type T and returns a Promise which resolves with an Either tuple. This tuple
 * either contains the resolved value of type T as the first element and undefined as the second if the promise
 * resolves successfully, or undefined as the first element and an Error as the second if the promise is rejected.
 *

 * @template T The type of the result value.
 * @param {Promise<T>} promise - The promise to be wrapped in an Either. This is an asynchronous operation that
 * should resolve with a value of type T or reject with an Error.
 * @return {Promise<Either<T>>} A Promise that resolves with an Either tuple. This Either is [T, undefined] with
 * the first element set to the value resolved by the promise if successful, and [undefined, Error] in case of failure.
 * The error will always be an instance of Error.
 *
 * @example
 * // Example of wrapping an async function that might fail:
 * async function fetchData(url: string): Promise<string> {
 *   const response = await fetch(url);
 *   if (!response.ok) {
 *     throw new Error('Network response was not ok');
 *   }
 *   return response.text();
 * }
 *
 * const [result, error] = await mightFail(fetchData('https://example.com'));
 *
 * if (error) {
 *   console.error('Fetching failed:', error.message);
 *   return;
 * }
 * console.log('Fetched data:', result);
 */
export const mightFail: MightFail<"go"> = new Proxy(
  mightFailFunction,
  makeProxyHandler(mightFailFunction)
) as MightFail<"go">

/**
 * Wraps a synchronous function in an Either type to safely handle exceptions. This function
 * executes a provided function that returns a value of type T, capturing any thrown errors.
 * It returns an Either tuple that either contains the value of type T as the first element and undefined as the second
 * if the function succeeds, or undefined as the first element and an Error as the second if the function throws an error.
 *

 * @template T The type of the result value.
 * @param {() => T} func - A wrapper function that is expected to invoke the throwing function.
 *  That function should return a value of type T or throw an error.
 * @return {Either<T>} An Either tuple that is either [T, undefined] with the first element set to the value returned by `func`,
 *                     or [undefined, Error] with the second element set to the caught error.
 * @example
 * // Example of wrapping a synchronous function that might throw an error:
 * const [result, error] = mightFailSync(() => JSON.parse(""));
 *
 * if (error) {
 *   console.error('Parsing failed:', error);
 *   return;
 * }
 * console.log('Parsed object:', result);
 */
export function mightFailSync<T, E extends Error = Error>(func: () => T): Either<T, E> {
  const { result, error } = standard.mightFailSync(func)
  return error
    ? createEither<T, E, "go">({ result: undefined, error: error as E }, "go")
    : createEither<T, E, "go">({ result, error: undefined }, "go")
}

/**
 * A constructor function that takes a value and returns an Either object with the value as the result and undefined as the error.
 *
 * @param result
 * @constructor
 */
export function Might<T>(result: T): Either<T, Error> {
  const standardMight = standard.Might<T>(result)
  return createEither<T, Error, "go">({ result: standardMight.result as T, error: undefined }, "go")
}

/**
 * A constructor function that takes an error and returns an Either object with undefined as the result and the error as the error.
 *
 * The error will **always** be an instance of Error.
 *
 * @param error
 * @constructor
 */
export function Fail<E extends Error = Error>(error: unknown): Either<undefined, E> {
  const standardFail = standard.Fail(error)
  return createEither<undefined, E, "go">({ result: undefined, error: standardFail.error! as E }, "go")
}
