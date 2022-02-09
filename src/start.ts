import { readdirSync } from "fs"
import path from "path"
import {assert, hasValue} from "js-utils"
import "./init"
import { readLine } from "./interactiveConsole.js"
import { Logger } from "./logger.js"
import {__dirname} from "./init"


export async function askWhatToExecute(options: string[]): Promise<string>{
  console.log("select script to run or 'q' to quit\n")

  for (let index = 0; index < options.length; index++) {
    let element = options[index]
    console.log(index + 1 + "> " + element)
  }
  let command = await readLine()
  if (command.toLowerCase() === "q"){
    process.exit(0)
  }
  let option = Number.parseInt(command)
  
  if (Number.isInteger(option) && option <= options.length && option > 0){
    Logger.info("executing \"" + options[option - 1] + "\"", true)
    return options[option - 1]
  }
  else{
    console.log("Invalid option")
    process.exit(1)
  }
}
