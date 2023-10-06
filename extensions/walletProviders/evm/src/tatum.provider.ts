import { EvmRpc, JsonRpcCall, LogFilter, TxPayload } from '@tatumio/tatum'
import { JsonRpcResponse } from '@tatumio/tatum/dist/src/dto'
import { ethers, JsonRpcPayload, JsonRpcProvider, JsonRpcResult, PerformActionRequest } from 'ethers'

export class TatumProvider extends JsonRpcProvider {
  constructor(private readonly chainId: number, private readonly evmRpc: EvmRpc) {
    super(undefined, chainId, { batchMaxCount: 1 })
  }

  async _perform(req: PerformActionRequest): Promise<unknown> {
    const { method, ...rest } = req

    switch (method) {
      case 'broadcastTransaction': {
        const { signedTransaction } = rest as { signedTransaction: string }
        const response = await this.evmRpc.sendRawTransaction(signedTransaction)

        return {
          blockNumber: await this.getBlockNumber(),
          hash: response.result,
          network: await this.getNetwork(),
        }
      }
      case 'call': {
        const { transaction, blockTag } = rest as { transaction: TxPayload; blockTag?: string | number }
        return (await this.evmRpc.call(transaction, blockTag)).result
      }
      case 'chainId': {
        return this.chainId
      }
      case 'estimateGas': {
        const { transaction } = rest as { transaction: TxPayload }
        const payload = {
          to: transaction.to as string,
          from: transaction.from as string,
          value: ethers.toQuantity(transaction.value as string),
        }
        const result = await this.evmRpc.estimateGas(payload)
        return result.result?.toNumber()
      }
      case 'getBalance': {
        const { address, blockTag } = rest as { address: string; blockTag?: string | number }
        return (await this.evmRpc.getBalance(address, blockTag)).result
      }
      case 'getBlock': {
        const { blockTag, blockHash, includeTransactions } = rest as {
          blockTag?: string | number
          blockHash?: string
          includeTransactions?: boolean
        }
        if (blockTag) {
          return (await this.evmRpc.getBlockByNumber(blockTag, includeTransactions)).result
        } else if (blockHash) {
          return (await this.evmRpc.getBlockByHash(blockHash, includeTransactions)).result
        }
        throw new Error('Either blockTag or blockHash must be provided')
      }
      case 'getBlockNumber': {
        return (await this.evmRpc.blockNumber()).result
      }
      case 'getCode': {
        const { address, blockTag } = rest as { address: string; blockTag?: string | number }
        return (await this.evmRpc.getCode(address, blockTag)).result
      }
      case 'getGasPrice': {
        return (await this.evmRpc.gasPrice()).result
      }
      case 'getLogs': {
        const { filter } = rest as { filter: LogFilter }
        return (await this.evmRpc.getLogs(filter)).result
      }
      case 'getStorage': {
        const { address, position, blockTag } = rest as {
          address: string
          position: string
          blockTag?: string | number
        }
        return (await this.evmRpc.getStorageAt(address, position, blockTag)).result
      }
      case 'getTransaction': {
        const { hash } = rest as { hash: string }
        return (await this.evmRpc.getTransactionByHash(hash)).result
      }
      case 'getTransactionCount': {
        const { address, blockTag } = rest as { address: string; blockTag?: string | number }
        return (await this.evmRpc.getTransactionCount(address, blockTag)).result?.toNumber()
      }
      case 'getTransactionReceipt': {
        const { hash } = rest as { hash: string }
        return (await this.evmRpc.getTransactionReceipt(hash)).result
      }
      case 'getTransactionResult': {
        const { hash } = rest as { hash: string }
        return (await this.evmRpc.traceTransaction(hash)).result
      }
      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  }

  async _send(payload: JsonRpcPayload | JsonRpcPayload[]): Promise<JsonRpcResult[]> {
    if (Array.isArray(payload)) {
      const responses = await Promise.all(
        payload.map((p) => this.evmRpc.rawRpcCall<JsonRpcResponse<unknown>>(p as JsonRpcCall)),
      )
      return responses.map((response) => ({ id: response.id as number, result: response.result }))
    } else {
      const response = await this.evmRpc.rawRpcCall<JsonRpcResponse<unknown>>(payload as JsonRpcCall)
      return [{ id: response.id as number, result: response.result }]
    }
  }
}
