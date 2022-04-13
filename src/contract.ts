import BN from "bn.js"
import { Account } from "near-api-js"
import {getTransactionLastResult, FinalExecutionStatus, FinalExecutionOutcome} from "near-api-js/lib/providers/provider"
import {asConst, hasValue, isString} from "js-utils"

export class Contract<T extends _ContractSpec, S extends Account | string> {

  accountId: string
  account: S extends Account ? Account : null
  view: Record<T["viewMethods"][number]["name"], (account: S extends Account ? Account | null : Account, args?:T["viewMethods"][number]["args"])=> Promise<T["viewMethods"][number]["returnValue"]>> = {} as any
  call: Record<T["changeMethods"][number]["name"], (account: S extends Account ? Account | null : Account, args?:T["changeMethods"][number]["args"], gas?:BN, attachedDeposit?:BN)=> Promise<FinalExecutionOutcome>> = {} as any
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
    contractSpec.changeMethods.forEach(methodName=>{
      const fun = async (account?: Account, args?:Object, gas:BN = new BN(300000000000000), attachedDeposit:BN = new BN(0))=>{
        const element = {
          contractId: this.accountId,
          methodName: methodName.name,
          args: args ?? {},
          gas,
          attachedDeposit
        } 
        let caller = hasValue(account) ? account : this.account as Account
        return await caller.functionCall(element);
      }
      
      Object.defineProperty(this.call, methodName.name, {
        writable: false,
        enumerable: true,
        value: fun
      })
    })

    contractSpec.viewMethods.forEach(methodName=>{
      const fun = async (account?: Account, args?:Object)=>{
        let caller = hasValue(account) ? account : this.account as Account
        return await caller.viewFunction(this.accountId, methodName.name, args);
      }
      Object.defineProperty(this.view, methodName.name, {
        writable: false,
        enumerable: true,
        value: fun
      })
    })
  }
}

export type _ContractSpec = {
  changeMethods: readonly CtrMethodDefinition<any, any>[]
  viewMethods: readonly CtrMethodDefinition<any, any>[]
  wasmName: string
  name: string
}
export const ContractSpec = (() => asConst<_ContractSpec>())()
 
export type CtrMethodDefinition<T extends Object, R extends any> = {
  name: string,
  args: T,
  returnValue: R
}