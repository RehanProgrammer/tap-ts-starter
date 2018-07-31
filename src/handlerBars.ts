import * as tapTypes from './singer/tap-types'
import { template } from 'handlebars'

let handlebars = require('handlebars')
/*var source = "<Hello, my name is {{name}}. I am from {{hometown}}. I have " +
        "{{kids.length}} kids" +
        "{{#kids}}{{name}} is {{age}}{{/kids}}";*/
/*var data = {
        "name": "Alan", "hometown": "Somewhere, TX",
        "kids": [{ "name": "Jimmy", "age": "12" }, { "name": "Sally", "age": "4" }]
    };*/
/** extend ConfigType as needed for this tap; this will describe tap-config.json */
export interface ConfigType extends tapTypes.ConfigType {
  /** set the name of the stream to be returned by the parser */
  stream_name?: string
  /** tap-json needs a map to describe the desired conversion  */
  template?: any
  templateFolder?: string
}
/** extend allConfigs to use our extended ConfigType */
export interface allConfigs extends tapTypes.allConfigs {
  config: ConfigType
}
var source =
  'Hello, my name is {{name}}. I am from {{hometown}}. I have  {{kids.length}} kids: {{#kids}}{{name}} is {{age}}{{/kids}}'
var data = {
  name: 'Alan',
  hometown: 'Somewhere, TX',
  kids: [
    {
      name: 'Jimmy',
      age: '12'
    },
    {
      name: 'Sally',
      age: '4'
    }
  ]
}
export async function target_text(buffer: any, configObjs: allConfigs) {
  let toParseObj
  if (buffer instanceof Buffer) {
    toParseObj = buffer.toString()
  }
  let Template = JSON.stringify(configObjs.config.template)
  console.log(Template)
  let template = handlebars.compile(source)
  var result = template(data)
  console.log(result)
}
