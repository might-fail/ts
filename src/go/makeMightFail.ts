import { type Either } from "./Either.js"
import { mightFail, mightFailSync } from "./mightFail.js"

/**
 * Utility type that unwraps a Promise type. If T is a Promise, it extracts the type the Promise resolves to,
 * providing direct access to the underlying value type.
 *
 * @template T The type to be unwrapped if it's a Promise.
 */
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

/**
 * Wraps a promise-returning function in another function that instead of returning a Promise directly,
 * returns a Promise that resolves with an Either. This allows for the handling of both resolved values and
 * errors in a consistent, functional way.
 *

 * @template T The function type that returns a Promise.
 * @param {T} func - The async function to be wrapped. This function should return a Promise.
 * @return {Function} A new function that, when called, returns a Promise that resolves with an Either tuple.
 * The Either tuple contains either the resolved value of the original Promise as the first element and undefined as the second,
 * or undefined as the first element and an Error as the second if the Promise was rejected.
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
 * const safeFetchData = makeMightFail(fetchData);
 * const [result, error] = await safeFetchData('https://example.com');
 *
 * if (error) {
 *   console.error('Fetching failed:', error.message);
 *   return
 * }
 * console.log('Fetched data:', result);
 */
export function makeMightFail<T extends (...args: any[]) => Promise<any>, E extends Error = Error>(
  func: T
): (...funcArgs: Parameters<T>) => Promise<Either<UnwrapPromise<ReturnType<T>>, E>> {
  return async (...args: Parameters<T>) => {
    const promise = func(...args)
    return mightFail(promise)
  }
}

/**
 * Wraps a synchronous function that might throw an exception in another function that,
 * instead of throwing, returns an Either tuple. This tuple contains either the value returned by the function
 * if it executes successfully as the first element and undefined as the second, or undefined as the first element
 * and an Error as the second if the function throws.
 *

 * @template T The function type that might throw an error.
 * @param {T} func - The function to be wrapped. This function might throw an exception.
 * @return {Function} A new function that, when called, returns an Either tuple with either a result or an error.
 *
 * @example
 * // Example of wrapping a synchronous function that might throw an error:
 * function parseJSON(jsonString: string) {
 *   return JSON.parse(jsonString); // This might throw
 * }
 *
 * const safeParseJSON = makeMightFailSync(parseJSON);
 * const [result, error] = safeParseJSON('{"valid": "json"}');
 *
 * if (error) {
 *   console.error('Parsing failed:', error);
 *   return;
 * }
 * console.log('Parsed object:', result);
 */
export function makeMightFailSync<T extends (...args: any[]) => any, E extends Error = Error>(
  func: T
): (...funcArgs: Parameters<T>) => Either<ReturnType<T>, E> {
  return (...args: Parameters<T>) => {
    const throwingFunction = () => func(...args)
    return mightFailSync(throwingFunction)
  }
}
