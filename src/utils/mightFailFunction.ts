import { handleError } from "./errors.js"
import { createEither } from "./createEither.js"
import { MightFailFunction, createMightFailPromise } from "./utils.type.js"

export const mightFailFunction: MightFailFunction<"standard"> = function <T, E extends Error = Error>(
  promise: T
) {
  const basePromise = (async () => {
    try {
      const result = await promise
      return createEither<Awaited<T>, E>({ result, error: undefined })
    } catch (err) {
      const error = handleError<E>(err)
      return createEither<Awaited<T>, E>({ error, result: undefined })
    }
  })()
  
  return createMightFailPromise(basePromise)
}
