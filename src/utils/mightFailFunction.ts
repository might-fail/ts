import { type Either } from "../Either.js"
import { handleError } from "./errors.js"
import { createEither } from "./createEither.js"
import { MightFailFunction } from "./utils.type.js"

export const mightFailFunction: MightFailFunction<"standard"> = async function <T, E extends Error = Error>(
  promise: T
): Promise<Either<Awaited<T>, E>> {
  try {
    const result = await promise
    return createEither<Awaited<T>, E>({ result, error: undefined })
  } catch (err) {
    const error = handleError<E>(err)
    return createEither<Awaited<T>, E>({ error, result: undefined })
  }
}
