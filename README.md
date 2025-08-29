# Might Fail

A TypeScript library for handling async and sync errors without `try` and `catch` blocks. Inspired by other languages that utilize Result or Either types for safer error handling. 

This works for sync and async code, and you can choose the error handling style that you like.

Scroll to the bottom for the motivation section (why `try,catch,finally` blocks are bad).

## Docs

[https://mightfail.dev](https://mightfail.dev)

## Install

[![JSR](https://jsr.io/badges/@might/fail)](https://jsr.io/@might/fail)
[![npm version](https://img.shields.io/npm/v/might-fail.svg)](https://www.npmjs.com/package/might-fail)


## Style 

There's three different styles to choose from and they all work the same way, but you can choose your favorite API. 

All examples are in the default style, but you **can** use any of the three styles.


### Tuple Style

```ts
import { mightFail } from "might-fail"; // from "@might/fail"

const [error, result] = await mightFail(promise);
```

### Object Style

```ts
import { mightFail } from "might-fail"; // from "@might/fail"

const { error, result } = await mightFail(promise);
```

### Go Style

```ts
import { mightFail } from "might-fail/go"; // from "@might/fail/go"

const [result, error] = await mightFail(promise);
```


## Async

### Wrap Promise in `mightFail`

```ts
const [ error, result ] = await mightFail(axios.get("/posts"));

if (error) {
  // handle error
  return;
}

const posts = result.data
posts.map((post) => console.log(post.title));
```

**or:**

```ts
const [ networkError, result ] = await mightFail(fetch("/posts"));

if (networkError) {
  // handle network error
  return;
}

if (!result.ok) {
  // handle an error response from server
  return;
}

const [ convertToJSONError, posts ] = await mightFail(
  result.json()
);

if (convertToJSONError) {
  // handle convertToJSONError
  return;
}

posts.map((post) => console.log(post.title));
```

### Or Wrap Async Function in `makeMightFail`

```ts
const get = makeMightFail(axios.get);
const [ error, result ] = await get("/posts");

if (error) {
  // handle error
  return;
}

const posts = result.data
posts.map((post) => console.log(post.title));
```

### `.map`

```ts
const get = makeMightFail(axios.get);
const [ error, result ] = await get("/posts").map(post => post.title);

if (error) {
  // handle error
  return;
}

const titles = result.data
titles.map((post) => console.log(title));
```

## Sync


### Wrap throwing functions in `mightFailSync`

```ts
const [ error, result ] = mightFailSync(() => JSON.parse("")); // JSON.parse might throw
if (error) {
  console.error('Parsing failed:', error);
  return
}
console.log('Parsed object:', result);
```

### Or Wrap Sync Function in `makeMightFailSync`

```ts
function parseJSON(jsonString: string) {
  return JSON.parse(jsonString); // This might throw
}
const safeParseJSON = makeMightFailSync(parseJSON);

const [ error, result ] = safeParseJSON("");

if (error) {
  console.error("Parsing failed:", error);
  return;
}
console.log("Parsed object:", result);
```

---

## Either Type

`await`ing the `mightFail` functions will return an `Either` type with either an `error` or a `result`.

- `error` **always** has the type `Error | undefined`.
  - If an instance of `Error` is not thrown, then a new `Error` will be created from the thrown value.
- `result` always has the type `T | undefined` where `T` is the type of the result of the promise passed to `mightFail`.

This means that the you never lose the type information of the result of the promise passed to `mightFail`.

The structure of the `Either` type can be "standard", "tuple", or "go" which you can choose based on your preference. Standard is the default for now, typle and go can be used by importing mightfail from the `tuple` or `go` subdirectory.

- `standard` - `{ error: Error | undefined, result: T | undefined }`
- `tuple` - `[Error | undefined, T | undefined]`
- `go` - `[T | undefined, Error | undefined]`

--- 

## Static Methods

`mightFail` has static methods that wrap the corresponding static methods of `Promise`.

- [`Promise.race`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
- [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [`Promise.any`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)


- `await mightFail.all([])`
- `await mightFail.race([])`
- `await mightFail.any([])`

These are identical to the static methods on `Promise` but they return an `Either` type.

---

## Motivation

I think throwing exceptions is cool, I like that an exception breaks control flow and I like exception propogation. The only thing I don't like catching exceptions. This mostly happens at the most "user facing" part of the code like an api endpoint or a UI component, the outer most function call. So catching an exception needs to notify the user that something went wrong, log the error for debugging, and stop the currently execution flow. 

### Guard ✅

Guarding allows you to handle your errors early and return from the function early, making them more readable and easier to reason about.

```ts
const { error: networkError, result } = await mightFail(fetch("/posts"));
// guard against a network error
if (networkError) {
  return;
}
// guard against an error response from the server
if (!result.ok) {
  return;
}
const { error: convertToJSONError, result: posts } = await mightFail(
  result.json()
);
// guard against an error converting the response to JSON
if (convertToJSONError) {
  return;
}

// success case, unnested and at the bottom of the function
posts.map((post) => console.log(post.title));
```

The success case is now the only code that is not nested in an `if` statement. It's also at the very bottom of the function making it easy to find.

### Everything in One Try/Catch Block ❌

```ts
try {
  const response = await fetch("/posts");

  if (!response.ok) {
    // handle an error response from server
    return;
  }
  const posts = await response.json();

  posts.map((post) => console.log(post.title));
} catch (error) {
  // handle any errors, not sure which one though 🤷‍♀️
}
```

This is bad because:

- Error handling happens in multiple places in the function.
- The catch block will catch **any** and **all** errors which makes it difficult to handle different errors differently.
- All the success case code will happen inside of the try block

### Multiple Try/Catch Blocks ❌

```ts
let response: Response;
try {
  response = await fetch("/posts");
} catch (error) {
  // guard against a network error
  return;
}
if (!response.ok) {
  // guard against an error response from server
  return;
}

let posts: Post[];
try {
  posts = await response.json();
} catch (error) {
  // guard against an error converting the response to JSON
  return;
}

posts.map((post) => console.log(post.title));
```

Declaring the variable ahead of time is a little weird and it makes infering the type of the variable a little more difficult. Also, try catch finally blocks can be confusing.

### `try` `catch` `finally` can be confusing ❌

```ts
function something() {
  try {
    throw new Error("something went wrong");
  } catch(error) {
    console.log("error happened")
    return "error return"
  } finally {
    console.log("finally happened")
    return "finally return"
  }
  return "something return"
}
console.log(something())
```

Can every single dev in your team understand what the above code will print out?
