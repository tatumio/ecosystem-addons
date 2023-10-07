import { EvmRpc, JsonRpcCall, LogFilter, TxPayload } from '@tatumio/tatum'
import { JsonRpcResponse } from '@tatumio/tatum/dist/src/dto'
import {
  Network as EthNetwork,
  JsonRpcPayload,
  JsonRpcProvider,
  JsonRpcResult,
  PerformActionRequest,
  ethers,
} from 'ethers'

export class TatumProvider extends JsonRpcProvider {
  constructor(private readonly chainId: number, private readonly evmRpc: EvmRpc) {
    super(undefined, chainId, { batchMaxCount: 1 })
  }

  async _perform(req: PerformActionRequest): Promise<unknown> {
    const { method, ...rest } = req

    switch (method) {
      case 'broadcastTransaction': {
        const { signedTransaction } = rest as { signedTransaction: string }
        return this.handleRpcResponse(this.evmRpc.sendRawTransaction(signedTransaction))
      }
      case 'call': {
        const { transaction, blockTag } = rest as { transaction: TxPayload; blockTag?: string | number }
        return this.handleRpcResponse(this.evmRpc.call(transaction, blockTag))
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
        const result = await this.handleRpcResponse(this.evmRpc.estimateGas(payload))
        return result.toNumber()
      }
      case 'getBalance': {
        const { address, blockTag } = rest as { address: string; blockTag?: string | number }
        return this.handleRpcResponse(this.evmRpc.getBalance(address, blockTag))
      }
      case 'getBlock': {
        const { blockTag, blockHash, includeTransactions } = rest as {
          blockTag?: string | number
          blockHash?: string
          includeTransactions?: boolean
        }
        if (blockTag) {
          return this.handleRpcResponse(this.evmRpc.getBlockByNumber(blockTag, includeTransactions))
        } else if (blockHash) {
          return this.handleRpcResponse(this.evmRpc.getBlockByHash(blockHash, includeTransactions))
        }
        throw new Error('Either blockTag or blockHash must be provided')
      }
      case 'getBlockNumber': {
        const response = await this.handleRpcResponse(this.evmRpc.blockNumber())
        return response.toNumber()
      }
      case 'getCode': {
        const { address, blockTag } = rest as { address: string; blockTag?: string | number }
        return this.handleRpcResponse(this.evmRpc.getCode(address, blockTag))
      }
      case 'getGasPrice': {
        return this.handleRpcResponse(this.evmRpc.gasPrice())
      }
      case 'getLogs': {
        const { filter } = rest as { filter: LogFilter }
        return this.handleRpcResponse(this.evmRpc.getLogs(filter))
      }
      case 'getStorage': {
        const { address, position, blockTag } = rest as {
          address: string
          position: string
          blockTag?: string | number
        }
        return this.handleRpcResponse(this.evmRpc.getStorageAt(address, position, blockTag))
      }
      case 'getTransaction': {
        const { hash } = rest as { hash: string }
        return this.handleRpcResponse(this.evmRpc.getTransactionByHash(hash))
      }
      case 'getTransactionCount': {
        const { address, blockTag } = rest as { address: string; blockTag?: string | number }
        const response = await this.handleRpcResponse(this.evmRpc.getTransactionCount(address, blockTag))
        return response.toNumber()
      }
      case 'getTransactionReceipt': {
        const { hash } = rest as { hash: string }
        return this.handleRpcResponse(this.evmRpc.getTransactionReceipt(hash))
      }
      case 'getTransactionResult': {
        const { hash } = rest as { hash: string }
        return this.handleRpcResponse(this.evmRpc.traceTransaction(hash))
      }
      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  }

  async getNetwork(): Promise<EthNetwork> {
    return EthNetwork.from(this.chainId)
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

  private async handleRpcResponse<T>(promise: Promise<JsonRpcResponse<T>>): Promise<T> {
    const response = await promise

    if (!response?.result) {
      throw Error(JSON.stringify(response.error))
    }

    return response.result
  }
}
