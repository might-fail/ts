import type { Either as StandardEither } from "../Either.js"
import type { Either as GoEither } from "../go/Either.js"
import { createEither } from "./createEither.js"

export interface MightFailPromise<T, E extends Error = Error> extends Promise<StandardEither<T, E>> {
  map<U>(fn: (value: T) => U): MightFailPromise<U, E>
}

export function createMightFailPromise<T, E extends Error = Error>(
  basePromise: Promise<StandardEither<T, E>>
): MightFailPromise<T, E> {
  return Object.assign(basePromise, {
    map<U>(fn: (value: T) => U): MightFailPromise<U, E> {
      const mappedPromise = basePromise.then(either => {
        if (either.error) {
          return createEither<U, E>({ error: either.error, result: undefined }) as StandardEither<U, E>
        }
        try {
          const mappedValue = fn(either.result!)
          return createEither<U, E>({ error: undefined, result: mappedValue }) as StandardEither<U, E>
        } catch (err) {
          const error = err instanceof Error ? err as E : new Error(String(err)) as E
          return createEither<U, E>({ error, result: undefined }) as StandardEither<U, E>
        }
      })
      
      return createMightFailPromise(mappedPromise)
    }
  }) as MightFailPromise<T, E>
}

export type EitherMode = "standard" | "go" | "any"

export type AnyEither<T, E extends Error = Error> = StandardEither<T, E> | GoEither<T, E>

export type MightFailFunction<TEitherMode extends EitherMode> = <T, E extends Error = Error>(
  promise: T
) => TEitherMode extends "standard"
    ? MightFailPromise<Awaited<T>, E>
    : TEitherMode extends "go"
      ? Promise<GoEither<Awaited<T>, E>>
      : MightFailPromise<Awaited<T>, E> | Promise<GoEither<Awaited<T>, E>>

export type PromiseFulfilledResult<T> = {
  status: "fulfilled"
  value: T
}
export type PromiseRejectedResult = {
  status: "rejected"
  reason: any
}
export type PromiseSettledResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult

export type MightFail<
  TEitherMode extends EitherMode,
  TPromiseStaticMethods = PromiseStaticMethods<TEitherMode>
> = MightFailFunction<TEitherMode> & TPromiseStaticMethods

export interface PromiseStaticMethods<TEitherMode extends EitherMode> {
  /**
   * Wraps a Promise.all call in a mightFail function.
   * @param values - An iterable of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Awaited<Either<T[]>>>
   */
  all<T extends readonly unknown[] | []>(
    values: T
  ): TEitherMode extends "standard"
      ? MightFailPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }>
      : TEitherMode extends "go"
        ? Promise<GoEither<{ -readonly [P in keyof T]: Awaited<T[P]> }>>
        : MightFailPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }> | Promise<GoEither<{ -readonly [P in keyof T]: Awaited<T[P]> }>>

  /**
   * (From lib.es2025.iterable.d.ts)
   * Wraps a Promise.all call in a mightFail function.
   * @param values - An iterable of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Awaited<Either<T[]>>>
   */
  all<T>(
    values: Iterable<T | PromiseLike<T>>
  ): TEitherMode extends "standard"
      ? MightFailPromise<T[]>
      : TEitherMode extends "go"
        ? Promise<GoEither<T[]>>
        : MightFailPromise<T[]> | Promise<GoEither<T[]>>

  /**
   * Wraps a Promise.race call in a mightFail function.
   *
   * @param values - An array of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Awaited<Either<T>>>
   */
  race<T>(
    values: Iterable<T | PromiseLike<T>>
  ): TEitherMode extends "standard"
      ? MightFailPromise<T>
      : TEitherMode extends "go"
        ? Promise<GoEither<T>>
        : MightFailPromise<T> | Promise<GoEither<T>>

  /**
   * Wraps a Promise.race call in a mightFail function.
   * @param values - An array of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Awaited<Either<T[number]>>>
   */
  race<T extends readonly unknown[] | []>(
    values: T
  ): TEitherMode extends "standard"
      ? MightFailPromise<T[number]>
      : TEitherMode extends "go"
        ? Promise<GoEither<T[number]>>
        : MightFailPromise<T[number]> | Promise<GoEither<T[number]>>

  /**
   * Wraps a Promise.any call in a mightFail function.
   *
   * @param values - An array of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Either<Awaited<T[number]>>>
   */
  any<T extends readonly unknown[] | []>(
    values: T
  ): TEitherMode extends "standard"
      ? MightFailPromise<T[number], AggregateError>
      : TEitherMode extends "go"
        ? Promise<GoEither<T[number], AggregateError>>
        : MightFailPromise<T[number], AggregateError> | Promise<GoEither<T[number], AggregateError>>

  /**
   * Wraps a Promise.any call in a mightFail function.
   *
   * @param values - An iterable of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Either<Awaited<T>>>
   */
  any<T>(
    values: Iterable<T | PromiseLike<T>>
  ): TEitherMode extends "standard"
      ? MightFailPromise<T, AggregateError>
      : TEitherMode extends "go"
        ? Promise<GoEither<T, AggregateError>>
        : MightFailPromise<T, AggregateError> | Promise<GoEither<T, AggregateError>>
}
