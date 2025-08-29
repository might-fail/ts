import { expect, test, describe } from "vitest"
import { mightFail } from "../src/index"

describe("mightFail static methods with .map", () => {
  test("mightFail.all supports .map", async () => {
    const promises = [
      Promise.resolve({ id: 1, name: "John" }),
      Promise.resolve({ id: 2, name: "Jane" })
    ]
    
    const { error, result } = await mightFail.all(promises)
      .map(users => users.map(user => user.name))
    
    expect(error).toBe(undefined)
    expect(result).toEqual(["John", "Jane"])
  })

  test("mightFail.all preserves error with .map", async () => {
    const promises = [
      Promise.resolve({ id: 1, name: "John" }),
      Promise.reject(new Error("API error"))
    ]
    
    const { error, result } = await mightFail.all(promises)
      .map(users => users.map(user => user.name))
    
    expect(result).toBe(undefined)
    expect(error?.message).toBe("API error")
  })

  test("mightFail.all catches transformation errors", async () => {
    const promises = [
      Promise.resolve({ id: 1, name: "John" }),
      Promise.resolve({ id: 2, name: "Jane" })
    ]
    
    const { error, result } = await mightFail.all(promises)
      .map(() => {
        throw new Error("transformation error")
      })
    
    expect(result).toBe(undefined)
    expect(error?.message).toBe("transformation error")
  })

  test("mightFail.all supports chained .map", async () => {
    const promises = [
      Promise.resolve({ id: 1, score: 85 }),
      Promise.resolve({ id: 2, score: 92 })
    ]
    
    const { error, result } = await mightFail.all(promises)
      .map(users => users.map(user => user.score))
      .map(scores => scores.reduce((sum, score) => sum + score, 0))
      .map(total => `Total score: ${total}`)
    
    expect(error).toBe(undefined)
    expect(result).toBe("Total score: 177")
  })
})