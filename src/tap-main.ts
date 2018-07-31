/**
 * This module is the entry point for local execution as a Singer tap (see the [spec](https://github.com/singer-io/getting-started/blob/master/docs/SPEC.md))
 */

/** this is a dummy single-line comment needed for documentation build; a hack for https://github.com/TypeStrong/typedoc/issues/603 */

/** DummyClass is used in testing (see ```npm test``` in package.json) */
export default class DummyClass {}

import * as configLoader from './singer/tap-load-config'
//import * as parseMime from './parse-mime'
//export { parseItem } from './parse-mime'
import * as scanDir from './scan-dir'
import * as handleBars from './handlerBars'
export * from './handlerBars'
// show developers that code has started to run
console.log('working!')

/** mainFunction is the main code to be run.
 *
 * This code is in its own function because it uses "await" to call async functions, and
 * the await keyword can only be used in an async function.
 */
async function mainFunction() {
  try {
    var configObjs = await configLoader.loadConfig()
    return scanDir.scanDir(configObjs, handleBars.target_text)
  } catch (error) {
    // Handle errors
    console.error('Error: ', error)
  }
}

// call mainFunction if this is the main function (but not if it is just imported by another function)
if (process.argv[1].includes('tap-main')) mainFunction()
