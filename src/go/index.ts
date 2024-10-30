/**
   * @module
   *
   * This module contains the interface to use the result of mightFail as an error-last tuple.
   *
   * This aligns with the proposal-safe-assignment-operator: https://github.com/arthurfiorette/proposal-safe-assignment-operator?tab=readme-ov-file#why-not-data-first
   *
   * If you want to use error-last style, just like golang, use the `/go` module.
   *
+  * @example
+  * ```ts
+  * import { mightFail } from "@might/fail/tuple";
+  *
+  * const [error, result] = await mightFail(promise);
+  * ```
   */

import { type Either } from "./Either"
import { mightFail, mightFailSync, Might, Fail } from "./mightFail"
import { makeMightFail, makeMightFailSync } from "./makeMightFail"
import { NotUndefined } from "../utils/utils.type"

export { Either, mightFail, makeMightFail, mightFailSync, makeMightFailSync, Might, Fail, type NotUndefined }
const defaultExport = {
  mightFail,
  makeMightFail,
  mightFailSync,
  makeMightFailSync,
  Might,
  Fail
}
export default defaultExport
