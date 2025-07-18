import { type Either } from "./Either.js"
import { mightFail, mightFailSync, Might, Fail } from "./mightFail.js"
import { makeMightFail, makeMightFailSync } from "./makeMightFail.js"

export { Either, mightFail, makeMightFail, mightFailSync, makeMightFailSync, Might, Fail }
const defaultExport = {
  mightFail,
  makeMightFail,
  mightFailSync,
  makeMightFailSync,
  Might,
  Fail
}
export default defaultExport
