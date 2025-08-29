import { expect, test, describe } from "vitest"
import { mightFail, makeMightFail } from "../src/index"

describe("Either iterability with .map", () => {
  test("mightFail result is destructurable", async () => {
    const [error, result] = await mightFail(Promise.resolve("test"))
    expect(error).toBe(undefined)
    expect(result).toBe("test")
  })

  test("mightFail with .map result is destructurable", async () => {
    const [error, result] = await mightFail(Promise.resolve("test")).map(x => x.toUpperCase())
    expect(error).toBe(undefined)
    expect(result).toBe("TEST")
  })

  test("makeMightFail result is destructurable", async () => {
    const safeResolve = makeMightFail((value: string) => Promise.resolve(value))
    const [error, result] = await safeResolve("test")
    expect(error).toBe(undefined)
    expect(result).toBe("test")
  })

  test("makeMightFail with .map result is destructurable", async () => {
    const safeResolve = makeMightFail((value: string) => Promise.resolve(value))
    const [error, result] = await safeResolve("test").map(x => x.toUpperCase())
    expect(error).toBe(undefined)
    expect(result).toBe("TEST")
  })

  test("mightFail.all result is destructurable", async () => {
    const [error, result] = await mightFail.all([Promise.resolve("a"), Promise.resolve("b")])
    expect(error).toBe(undefined)
    expect(result).toEqual(["a", "b"])
  })

  test("mightFail.all with .map result is destructurable", async () => {
    const [error, result] = await mightFail.all([Promise.resolve("a"), Promise.resolve("b")])
      .map(([first, second]) => first + second)
    expect(error).toBe(undefined)
    expect(result).toBe("ab")
  })

  test("error cases are destructurable", async () => {
    const [error, result] = await mightFail(Promise.reject(new Error("test error")))
    expect(result).toBe(undefined)
    expect(error?.message).toBe("test error")
  })

  test("error cases with .map are destructurable", async () => {
    const [error, result] = await mightFail(Promise.reject(new Error("test error")))
      .map((x: any) => x.toUpperCase())
    expect(result).toBe(undefined)
    expect(error?.message).toBe("test error")
  })

  test("Either supports for...of iteration", async () => {
    const either = await mightFail(Promise.resolve("test")).map(x => x.toUpperCase())
    const items: any[] = []
    for (const item of either) {
      items.push(item)
    }
    expect(items).toEqual([undefined, "TEST"])
  })

  test("Either supports array methods like forEach", async () => {
    const either = await mightFail(Promise.resolve("test")).map(x => x.toUpperCase())
    const items: any[] = []
    either.forEach((item: any) => items.push(item))
    expect(items).toEqual([undefined, "TEST"])
  })

  test("chained .map preserves iterability", async () => {
    const [error, result] = await mightFail(Promise.resolve({ count: 5 }))
      .map(data => data.count * 2)
      .map(doubled => doubled + 1)
      .map(final => final.toString())
    
    expect(error).toBe(undefined)
    expect(result).toBe("11")
  })
})