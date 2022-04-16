import BN from "bn.js"
import { Account } from "near-api-js"
import {getTransactionLastResult, FinalExecutionStatus, FinalExecutionOutcome} from "near-api-js/lib/providers/provider"
import {asConst, hasValue, isString} from "js-utils"

export class Contract<T extends ContractSpec, S extends Account | string> {

  accountId: string
  account: S extends Account ? Account : null
  view: {[key in keyof T["viewMethods"]]:(account: S extends Account ? Account | null : Account, args?:T["viewMethods"][key]["args"])=> Promise<T["viewMethods"][key]["returnValue"]>} = {} as any
  call: {[key in keyof T["changeMethods"]]:(account: S extends Account ? Account | null : Account, args?:T["changeMethods"][key]["args"], gas?:BN, attachedDeposit?:BN)=> Promise<FinalExecutionOutcome>} = {} as any
  name: string
  spec: T

  constructor(accountOrId: S, contractSpec: T, name?: string){
    this.spec = contractSpec
    this.name = name || contractSpec.name
    if (!isString(accountOrId)){
      this.accountId = accountOrId.accountId
      this.account = accountOrId as any
    }
    else{
      this.accountId = accountOrId
      this.account = null as any
    }
    Object.keys(contractSpec.changeMethods).forEach(methodName=>{
      const fun = async (account?: Account, args?:Object, gas:BN = new BN(300000000000000), attachedDeposit:BN = new BN(0))=>{
        const element = {
          contractId: this.accountId,
          methodName: methodName,
          args: args ?? {},
          gas,
          attachedDeposit
        } 
        let caller = hasValue(account) ? account : this.account as Account
        return await caller.functionCall(element);
      }
      
      Object.defineProperty(this.call, methodName, {
        writable: false,
        enumerable: true,
        value: fun
      })
    })

    Object.keys(contractSpec.viewMethods).forEach(methodName=>{
      const fun = async (account?: Account, args?:Object)=>{
        let caller = hasValue(account) ? account : this.account as Account
        return await caller.viewFunction(this.accountId, methodName, args);
      }
      Object.defineProperty(this.view, methodName, {
        writable: false,
        enumerable: true,
        value: fun
      })
    })
  }
}

export type ContractSpec = {
  changeMethods: CtrMethodDefinition
  viewMethods: CtrMethodDefinition
  wasmName: string
  name: string
}

export type CtrMethodDefinition = {
  [p: string]: {
    args: any,
    returnValue: any
  }
}
