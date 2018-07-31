/**
 * A "scanner" scans a resource collection, parsing the items it finds using the parser passed in
 * (see the [spec](https://github.com/singer-io/getting-started/blob/master/docs/SPEC.md#singer-specification))
 *
 * In this case, we are scanning a directory and parsing the files inside.
 */ /** this is a dummy single-line comment needed for documentation build; a hack for https://github.com/TypeStrong/typedoc/issues/603 */

/** fs-extra is a promise-enabled superset of the standard fs package */
import * as fse from 'fs-extra'
import * as tapTypes from './singer/tap-types'
import * as targetText from './tap-main'
/** generate json-schemas for our records, if needed */
var generateSchema = require('generate-schema') // typescript types aren't available so we load javascript-style instead of using typescript's import

/**
 * Scan a folder, running parser on each file it finds
 * - TODO: implement configObjs.state and configObjs.catalog, which are just stubs for now
 * - TODO: use interfaces instead of "any" here
 * @param configObjs
 * @param parser
 */
export async function scanDir(configObjs: targetText.allConfigs, parser: any) {
  let config = configObjs.config
  // future config options
  // let state = configObjs.state
  // let catalog = configObjs.catalog

  // TODO: allow schema(s) to be passed in in config
  let schema: any = null

  let filelist: string[] = await fse.readdir(config.target_folder as string)
  // remove directories from file list
  for (let i = filelist.length - 1; i > -1; i--) {
    let stat = fse.lstatSync(config.target_folder + '/' + filelist[i])
    if (stat.isDirectory()) filelist.splice(i, 1)
  }
  let parsedObjs = await Promise.all(
    // return an array of promises, one per filename, for Promise.all to run asynchronously
    filelist.map(async function(filename, idx) {
      let buffer = await fse.readFile(config.target_folder + '/' + filename)
      let templateFile = await fse.readFile(config.templateFolder + '/' + filename)
      configObjs.config.template = JSON.parse(templateFile.toString())
      return parser(buffer, configObjs) // the parsing is done here
    })
  )
  let parsing = (parsedObjs: any) => {
    if (parsedObjs.length == 0) return null

    // write the objects
    parsedObjs.forEach(function(parsedObj: any, idx: any) {
      if (parsedObj.length) {
        // parsedObj is actually an array, meaning that parser returned multiple record objects
        // instead of one, so we will parse each element of the array separately
        parsing(parsedObj)
      } else {
        let schm = new tapTypes.streamSchema()

        // if no schema exists, create a schema based on the first new object
        if (!schm.schema && parsedObjs[0].type != 'SCHEMA') {
          schm.schema = generateSchema.json(parsedObjs[0].record)
          schm.stream = parsedObjs[0].stream

          // write the schema
          console.log(JSON.stringify(schm))
        }

        console.log(JSON.stringify(parsedObj))
      }
    })
    // TODO: write STATE record
  }
  return parsing(parsedObjs)
}
