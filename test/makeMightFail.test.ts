import { expect, test } from "vitest"
import { makeMightFail } from "../src/index"

test("success returns the response", async () => {
  const resolve = (value: { message: string }) => Promise.resolve(value)
  const func = makeMightFail(resolve)
  const { error, result } = await func({ message: "success" })
  expect(error).toBe(undefined)
  expect(result!.message).toBe("success")
})

test("fail with error returns the error", async () => {
  const reject = (error: Error) => Promise.reject(error)
  const func = makeMightFail(reject)
  const { error, result } = await func(new Error("error"))
  expect(result).toBe(undefined)
  expect(error?.message).toBe("error")
})

test("fail without error returns an error", async () => {
  const reject = () => Promise.reject(undefined)
  const func = makeMightFail(reject)
  const { error, result } = await func()
  expect(result).toBe(undefined)
  expect(error?.message).toBeTruthy()
})

test("map transforms successful result", async () => {
  const resolve = (value: { count: number }) => Promise.resolve(value)
  const func = makeMightFail(resolve)
  const { error, result } = await func({ count: 5 }).map(data => data.count * 2)
  expect(error).toBe(undefined)
  expect(result).toBe(10)
})

test("map preserves error on failed result", async () => {
  const reject = (error: Error) => Promise.reject(error)
  const func = makeMightFail(reject)
  const { error, result } = await func(new Error("original error")).map(data => data * 2)
  expect(result).toBe(undefined)
  expect(error?.message).toBe("original error")
})

test("map catches errors during transformation", async () => {
  const resolve = (value: { count: number }) => Promise.resolve(value)
  const func = makeMightFail(resolve)
  const { error, result } = await func({ count: 5 }).map(() => {
    throw new Error("transformation error")
  })
  expect(result).toBe(undefined)
  expect(error?.message).toBe("transformation error")
})

test("map can be chained multiple times", async () => {
  const resolve = (value: { count: number }) => Promise.resolve(value)
  const func = makeMightFail(resolve)
  const { error, result } = await func({ count: 5 })
    .map(data => data.count * 2)
    .map(doubled => doubled + 1)
    .map(result => result.toString())
  expect(error).toBe(undefined)
  expect(result).toBe("11")
})
