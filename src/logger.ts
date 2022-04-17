import {readFileSync, writeFileSync} from "fs"
import path from "path"
import { isObject, isString, JSONPrettify, makeEnumerable } from "js-utils"
import { replacer } from "./util"


export class Logger{
  private _logfile: string
  static instance: Logger

  private constructor(logfile: string){
    this._logfile = logfile
  }

  get logFile(){
    return this._logfile
  }

  static getLogger(logfile?: string){
    if (!this.instance){
      if (logfile){
        this.instance = new Logger(logfile)
      }
      else{
        return null
      }
    }
    return this.instance
  }

  static info(msg:string | Object | Array<any>, _console?:boolean){
    this.log(msg, "INFO", _console)
  }

  static error(msg:string | Object | Array<any>, _console?:boolean){
    this.log(msg, "ERROR", _console)
  }

  private static log(msg: any, type: string, _console?:boolean){
    let date = new Date()
    let message
    if (isString(msg)){
      if (msg.length >= 2){
        message = msg.charAt(0).toUpperCase() + msg.substring(1)
      }
    }
    else if (isObject(msg)){
      message = JSONPrettify(makeEnumerable(msg), replacer)
    }
    else if (Array.isArray(msg)){
      message = JSONPrettify(msg, replacer)
    }

    let toLog = `[${date.getDay()}:${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]: ${type} - ${message ? message : msg}`
    if (_console){
      console.log(toLog)
    }
    if (this.instance){
      writeFileSync(this.instance._logfile, toLog + "\n", {flag:'a'})
    }
  }
}