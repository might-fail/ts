import type { Either as StandardEither } from "../Either.js"
import type { Either as GoEither } from "../go/Either.js"

export type EitherMode = "standard" | "go" | "any"

export type AnyEither<T, E extends Error = Error> = StandardEither<T, E> | GoEither<T, E>

export type MightFailFunction<TEitherMode extends EitherMode> = <T, E extends Error = Error>(
  promise: T
) => Promise<
  TEitherMode extends "standard"
    ? StandardEither<Awaited<T>, E>
    : TEitherMode extends "go"
      ? GoEither<Awaited<T>, E>
      : AnyEither<Awaited<T>, E>
>

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
  ): Promise<
    TEitherMode extends "standard"
      ? Awaited<StandardEither<{ -readonly [P in keyof T]: Awaited<T[P]> }>>
      : TEitherMode extends "go"
        ? Awaited<GoEither<{ -readonly [P in keyof T]: Awaited<T[P]> }>>
        : Awaited<AnyEither<{ -readonly [P in keyof T]: Awaited<T[P]> }>>
  >

  /**
   * (From lib.es2025.iterable.d.ts)
   * Wraps a Promise.all call in a mightFail function.
   * @param values - An iterable of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Awaited<Either<T[]>>>
   */
  all<T>(
    values: Iterable<T | PromiseLike<T>>
  ): Promise<
    TEitherMode extends "standard"
      ? Awaited<StandardEither<T[]>>
      : TEitherMode extends "go"
        ? Awaited<GoEither<T[]>>
        : Awaited<AnyEither<T[]>>
  >

  /**
   * Wraps a Promise.race call in a mightFail function.
   *
   * @param values - An array of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Awaited<Either<T>>>
   */
  race<T>(
    values: Iterable<T | PromiseLike<T>>
  ): Promise<
    TEitherMode extends "standard"
      ? Awaited<StandardEither<T>>
      : TEitherMode extends "go"
        ? Awaited<GoEither<T>>
        : Awaited<AnyEither<T>>
  >

  /**
   * Wraps a Promise.race call in a mightFail function.
   * @param values - An array of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Awaited<Either<T[number]>>>
   */
  race<T extends readonly unknown[] | []>(
    values: T
  ): Promise<
    TEitherMode extends "standard"
      ? Awaited<StandardEither<T[number]>>
      : TEitherMode extends "go"
        ? Awaited<GoEither<T[number]>>
        : Awaited<AnyEither<T[number]>>
  >

  /**
   * Wraps a Promise.any call in a mightFail function.
   *
   * @param values - An array of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Either<Awaited<T[number]>>>
   */
  any<T extends readonly unknown[] | []>(
    values: T
  ): Promise<
    TEitherMode extends "standard"
      ? StandardEither<Awaited<T[number]>, AggregateError>
      : TEitherMode extends "go"
        ? GoEither<Awaited<T[number]>, AggregateError>
        : AnyEither<Awaited<T[number]>, AggregateError>
  >

  /**
   * Wraps a Promise.any call in a mightFail function.
   *
   * @param values - An iterable of promises
   * @template T The type of the resolved values
   * @return {Promise} - Promise<Either<Awaited<T>>>
   */
  any<T>(
    values: Iterable<T | PromiseLike<T>>
  ): Promise<
    TEitherMode extends "standard"
      ? StandardEither<Awaited<T>, AggregateError>
      : TEitherMode extends "go"
        ? GoEither<Awaited<T>, AggregateError>
        : AnyEither<Awaited<T>, AggregateError>
  >
}
