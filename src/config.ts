import { existsSync, mkdirSync, readFileSync } from "fs"
import path from "path"
import { NetworkId } from "./near-connection"
import { hasValue, assert } from "js-utils"
import {__dirname} from "./init"


export function getConfig<T extends Network>(network: T): NetworkConfig<Network> {
  let config: NetworkConfig<T>
  switch (network) {
    case "local":
      config = {
        networkId: "sandbox",
        nodeUrl: "http://localhost:3030",
        master: {
          keyPath: "/tmp/near-sandbox/validator_key.json",
        }
      } as any
      break
    case "testnet":
      config = {
        networkId: "testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        existentAcc: {
        }
      } as any
      break
    default:
      throw Error("network type not implemented")
  }

  return config
}

export function makeLogFile(_path?: string): string{
  try {
    let date = new Date()
    let file = _path || path.join(global.__dirname, "logs", `log_${date.getDay()}:${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.txt`)
    if (!existsSync(path.dirname(file))) {
      mkdirSync(path.dirname(file))
    }
    return file
  }
  catch (e) {
    throw Error("error creating log file: " + e)
  }
}

export type Network = "local" | "testnet" | "betanet" | "mainnet"
export type NetworkConfig<T extends Network> = {
  networkId: NetworkId,
  nodeUrl: string,
  master: T extends "local" ? {
    keyPath: string
  } : undefined
}