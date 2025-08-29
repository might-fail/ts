import { describe, expect, it, test } from "vitest"
import { mightFail, Might, Fail } from "../src/index"

test("success returns the response", async () => {
  const { error, result } = await mightFail(Promise.resolve("success"))
  expect(result).toBe("success")
  expect(error).toBe(undefined)
})

test("fail with error returns the error", async () => {
  const { error, result } = await mightFail(Promise.reject(new Error("error")))
  expect(result).toBe(undefined)
  expect(error?.message).toBe("error")
})

test("fail without error returns an error", async () => {
  const { error, result } = await mightFail(Promise.reject(undefined))
  expect(result).toBe(undefined)
  expect(error?.message).toBeTruthy()
})

test("fail with string returns an error with that string as the message", async () => {
  const { error, result } = await mightFail(Promise.reject("error"))
  expect(result).toBe(undefined)
  expect(error?.message).toBe("error")
})

test("fail with object returns an error with that object as the message", async () => {
  const { error, result } = await mightFail(Promise.reject({ message: "error" }))
  expect(result).toBe(undefined)
  expect(error?.message).toBe("error")
})

test("async function that throws", async () => {
  const asyncFn = async () => {
    throw new Error("async error")
  }
  const { error, result } = await mightFail(asyncFn())
  expect(result).toBe(undefined)
  expect(error?.message).toBe("async error")
})

test("promise that resolves after delay", async () => {
  const delayedPromise = new Promise((resolve) => setTimeout(() => resolve("delayed success"), 100))
  const { error, result } = await mightFail(delayedPromise)
  expect(result).toBe("delayed success")
  expect(error).toBe(undefined)
})

test("promise that rejects after delay", async () => {
  const delayedPromise = new Promise((_, reject) => setTimeout(() => reject("delayed error"), 100))
  const { error, result } = await mightFail(delayedPromise)
  expect(result).toBe(undefined)
  expect(error?.message).toBe("delayed error")
})

describe("promise concurrent method wrappers", () => {
  describe("mightFail.all", () => {
    it("should resolve with an array of values when all promises resolve", async () => {
      const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
      const { result, error } = await mightFail.all(promises)
      expect(error).toBeUndefined()
      expect(result).toEqual([1, 2, 3])
    })

    it("should fail with the first error when any promise rejects", async () => {
      const promises = [Promise.resolve(1), Promise.reject(new Error("Error")), Promise.resolve(3)]
      const { result, error } = await mightFail.all(promises)
      expect(result).toBeUndefined()
      expect(error).toBeInstanceOf(Error)
      expect(error!.message).toBe("Error")
    })
  })

  describe("mightFail.race", () => {
    it("should resolve with the first resolved value", async () => {
      const promises = [Promise.resolve(1), Promise.reject(new Error("Error")), Promise.resolve(3)]
      const { result, error } = await mightFail.race(promises)
      expect(error).toBeUndefined()
      expect(result).toBe(1)
    })

    it("should reject with the first rejected error if it occurs before any promise resolves", async () => {
      const promises = [Promise.reject(new Error("Race Error")), Promise.resolve(1), Promise.resolve(2)]
      const { result, error } = await mightFail.race(promises)
      expect(result).toBeUndefined()
      expect(error).toBeInstanceOf(Error)
      expect(error!.message).toBe("Race Error")
    })
  })

  describe("mightFail.any", () => {
    it("should resolve with the first fulfilled value", async () => {
      const promises = [Promise.reject(new Error("Error 1")), Promise.resolve(2), Promise.reject(new Error("Error 2"))]
      const { result, error } = await mightFail.any(promises)
      expect(error).toBeUndefined()
      expect(result).toBe(2)
    })

    it("should reject with an AggregateError if all promises reject", async () => {
      const promises = [Promise.reject(new Error("Error 1")), Promise.reject(new Error("Error 2"))]
      const { result, error } = await mightFail.any(promises)
      expect(result).toBeUndefined()
      expect(error).toBeInstanceOf(Error)
      expect(error!.message).toBe("All promises were rejected")
    })
  })
})

describe("Either factories (Might & Fail)", () => {
  describe("Might", () => {
    it("should return an Either with the value as the result and undefined as the error", () => {
      const result = Might(5)
      expect(result).toEqual({
        result: 5,
        error: undefined
      })
    })
  })
  describe("Fail", () => {
    it("should return an Either with undefined as the result and the error as the error", () => {
      const error = new Error("error")
      const result = Fail(error)
      expect(result).toEqual({
        result: undefined,
        error
      })
    })

    it("should return an Either with undefined as the result and the error must be an instance of Error", () => {
      const error = "error"
      const result = Fail(error)
      expect(result).toEqual({
        result: undefined,
        error: new Error(error)
      })
    })
  })

  describe("map functionality", () => {
    test("map transforms successful result", async () => {
      const { error, result } = await mightFail(Promise.resolve({ count: 5 })).map(data => data.count * 2)
      expect(error).toBe(undefined)
      expect(result).toBe(10)
    })

    test("map preserves error on failed result", async () => {
      const { error, result } = await mightFail(Promise.reject(new Error("original error"))).map(data => data * 2)
      expect(result).toBe(undefined)
      expect(error?.message).toBe("original error")
    })

    test("map catches errors during transformation", async () => {
      const { error, result } = await mightFail(Promise.resolve({ count: 5 })).map(() => {
        throw new Error("transformation error")
      })
      expect(result).toBe(undefined)
      expect(error?.message).toBe("transformation error")
    })

    test("map can be chained multiple times", async () => {
      const { error, result } = await mightFail(Promise.resolve({ count: 5 }))
        .map(data => data.count * 2)
        .map(doubled => doubled + 1)
        .map(result => result.toString())
      expect(error).toBe(undefined)
      expect(result).toBe("11")
    })
  })
})
