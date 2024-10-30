import { type Either } from "./Either"
import { mightFail, mightFailSync, Might, Fail } from "./mightFail"
import { makeMightFail, makeMightFailSync } from "./makeMightFail"
import { NotUndefined } from "./utils/utils.type"

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
