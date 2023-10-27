import { EvmRpc, ITatumSdkContainer, Network, TatumSdkExtension } from '@tatumio/tatum'
import BigNumber from 'bignumber.js'
import { ethers, toBeHex } from 'ethers'
import { ERC20_TRANSFER_METHOD_SIGNATURE } from './consts'
import { TRACER } from './tracer'
import {
  SimulationResult,
  TokenDetails,
  TokenSimulationResult,
  TokenTransfer,
  TokenTransferPayload,
  Trace,
  TraceErc20,
  Transfer,
  TransferPayload,
} from './types'
import { matchStorageSlotsToAddresses } from './utils'

export class TransactionSimulator extends TatumSdkExtension {
  private readonly evmRpc: EvmRpc
  private minifiedTracer: string

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.evmRpc = this.tatumSdkContainer.getRpc<EvmRpc>()
  }

  init(): Promise<void> {
    this.minifiedTracer = TRACER
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*,\s*/g, ',')

    return Promise.resolve()
  }

  public async simulateTransfer(payload: Transfer): Promise<SimulationResult> {
    const transferPayload = this.getTransferPayload(payload)

    await this.prepareFees(transferPayload)

    const trace = await this.getTraceCall(transferPayload)

    this.handleTraceError(trace)

    return this.mapTraceToSimulationResultNative(payload, transferPayload, trace)
  }

  public async simulateTransferErc20(payload: TokenTransfer): Promise<TokenSimulationResult> {
    const tokenDetails = await this.getTokenDetails(payload)

    const data = this.generateErc20TransferData(payload.to, payload.value, tokenDetails)

    const tokenTransferPayload = this.getTokenTransferPayload(payload, data)

    await this.prepareFees(tokenTransferPayload)

    const trace = await this.getTraceCall(tokenTransferPayload)

    this.handleTraceError(trace)

    const matchedSlots = matchStorageSlotsToAddresses(
      [payload.to, payload.from],
      this.getStorageAddresses(trace, payload),
    )

    return this.mapTraceToSimulationResultErc20(
      payload,
      tokenTransferPayload,
      trace,
      tokenDetails,
      matchedSlots,
    )
  }

  private async getTokenDetails(payload: TokenTransfer): Promise<TokenDetails> {
    const decimalsPromise = this.evmRpc.getTokenDecimals(payload.tokenContractAddress)
    const tokenNamePromise = this.evmRpc.getTokenName(payload.tokenContractAddress)
    const tokenSymbolPromise = this.evmRpc.getTokenSymbol(payload.tokenContractAddress)

    const [decimals, tokenName, tokenSymbol] = await Promise.all([
      decimalsPromise,
      tokenNamePromise,
      tokenSymbolPromise,
    ])

    if (!decimals.result) throw new Error(`Failed to retrieve decimals for contract: ${payload.to} - ${JSON.stringify(decimals.error)}`)
    if (!tokenName.result) throw new Error(`Failed to retrieve token name for contract: ${payload.to} - ${JSON.stringify(tokenName.error)}`)
    if (!tokenSymbol.result) throw new Error(`Failed to retrieve token symbol for contract: ${payload.to} - ${JSON.stringify(tokenSymbol.error)}`)
    return { decimals: decimals.result, tokenName: tokenName.result, tokenSymbol: tokenSymbol.result }
  }

  private async prepareFees(payload: TransferPayload | TokenTransferPayload) {
    if (!payload.gas) {
      const fee = await this.evmRpc.estimateGas(payload)
      if (!fee.result) throw new Error(`Failed to estimate gas: ${JSON.stringify(fee.error)}`)
      payload.gas = `0x${fee.result?.toString(16)}`
    }

    if (!payload.gasPrice) {
      const gasPrice = await this.evmRpc.gasPrice()
      if (!gasPrice.result) throw new Error(`Failed to retrieve gas price: ${JSON.stringify(gasPrice.error)}`)
      payload.gasPrice = `0x${gasPrice.result.toString(16)}`
    }

    payload.from = payload.from.toLowerCase()
    payload.to = payload.to.toLowerCase()
  }

  private getStorageAddresses(trace: TraceErc20, payload: TokenTransfer) {
    return [...Object.keys(trace.stateDiff[payload.tokenContractAddress.toLowerCase()].storage)]
  }

  private getTransferPayload(payload: Transfer): TransferPayload {
    return {
      to: payload.to,
      from: payload.from,
      gas: payload.gas,
      gasPrice: payload.gasPrice,
      value: `0x${payload.value.toString(16)}`,
    }
  }

  private getTokenTransferPayload(payload: TokenTransfer, data: string): TokenTransferPayload {
    return {
      to: payload.tokenContractAddress,
      from: payload.from,
      gas: payload.gas,
      gasPrice: payload.gasPrice,
      value: '0x0',
      data: data,
    }
  }

  private async getTraceCall(payload: TransferPayload | TokenTransferPayload) {
    const jsonRpcResponse = await this.evmRpc.debugTraceCall(payload, 'latest', {
      tracer: this.minifiedTracer,
      tracerConfig: { onlyTopCall: false, timeout: '10s' },
    })

    if (!jsonRpcResponse.result)
      throw new Error(`Failed to trace call: ${JSON.stringify(jsonRpcResponse.error)}`)

    if (!Object.keys(jsonRpcResponse.result).length)
      throw new Error(`Failed to trace call - tracing returned empty result`)

    return jsonRpcResponse.result
  }

  private mapTraceToSimulationResultNative(
    payload: Transfer,
    transferPayload: TransferPayload,
    trace: Trace,
  ): SimulationResult {
    const balanceStateDiffFromAddress = trace.stateDiff[transferPayload.from].balance['*']
    const balanceStateDiffToAddress = trace.stateDiff[transferPayload.to].balance['*']

    return {
      transactionDetails: {
        from: payload.from,
        to: payload.to,
        value: payload.value,

        gasLimit: parseInt(transferPayload.gas!, 16),
        gasPrice: parseInt(transferPayload.gasPrice!, 16),
      },
      status: 'success',
      balanceChanges: {
        [payload.from]: {
          from: new BigNumber(balanceStateDiffFromAddress.from, 16),
          to: new BigNumber(balanceStateDiffFromAddress.to, 16),
        },
        [payload.to]: {
          from: new BigNumber(balanceStateDiffToAddress.from, 16),
          to: new BigNumber(balanceStateDiffToAddress.to, 16),
        },
      },
    }
  }

  private handleTraceError(trace: Trace | TraceErc20) {
    const traceError = trace.trace[0].error

    if (traceError) {
      throw new Error(`Transaction reverted with message: ${traceError}`)
    }
  }

  private mapTraceToSimulationResultErc20(
    payload: TokenTransfer,
    tokenTransferPayload: TokenTransferPayload,
    trace: TraceErc20,
    tokenDetails: TokenDetails,
    matchedSlots: Record<string, string>,
  ): TokenSimulationResult {
    const contractAddress = payload.tokenContractAddress.toLowerCase()
    const fromAddress = payload.from.toLowerCase()
    const storageStateDiffFromAddress =
      trace.stateDiff[contractAddress].storage[matchedSlots[payload.from]]['*']
    const storageStateDiffToAddress = trace.stateDiff[contractAddress].storage[matchedSlots[payload.to]]['*']
    const balanceStateDiffFromAddress = trace.stateDiff[fromAddress].balance['*']
    return {
      transactionDetails: {
        from: payload.from,
        to: payload.to,
        tokenContractAddress: payload.tokenContractAddress,
        data: tokenTransferPayload.data,
        gasLimit: parseInt(tokenTransferPayload.gas!, 16),
        gasPrice: parseInt(tokenTransferPayload.gasPrice!, 16),
      },
      status: 'success',
      balanceChanges: {
        [payload.from]: {
          from: new BigNumber(balanceStateDiffFromAddress.from, 16),
          to: new BigNumber(balanceStateDiffFromAddress.to, 16),
        },
      },
      tokenTransfers: {
        [payload.tokenContractAddress]: {
          name: tokenDetails.tokenName,
          symbol: tokenDetails.tokenSymbol,
          decimals: tokenDetails.decimals.toNumber(),
          [payload.from]: {
            from: new BigNumber(storageStateDiffFromAddress.from, 16).dividedBy(
              new BigNumber(10).pow(tokenDetails.decimals.toNumber()),
            ),
            to: new BigNumber(storageStateDiffFromAddress.to, 16).dividedBy(
              new BigNumber(10).pow(tokenDetails.decimals.toNumber()),
            ),
          },
          [payload.to]: {
            from: new BigNumber(storageStateDiffToAddress.from, 16).dividedBy(
              new BigNumber(10).pow(tokenDetails.decimals.toNumber()),
            ),
            to: new BigNumber(storageStateDiffToAddress.to, 16).dividedBy(
              new BigNumber(10).pow(tokenDetails.decimals.toNumber()),
            ),
          },
        },
      },
    }
  }

  private generateErc20TransferData(toAddress: string, amount: number, tokenDetails: TokenDetails): string {
    const amountWithDecimals = new BigNumber(amount).multipliedBy(
      new BigNumber(10).pow(tokenDetails.decimals.toNumber()),
    )
    const encodedAddress = ethers.zeroPadValue(toBeHex(toAddress), 32).slice(2)
    const encodedAmount = ethers.zeroPadValue(toBeHex(amountWithDecimals.toString()), 32).slice(2)

    return `${ERC20_TRANSFER_METHOD_SIGNATURE}${encodedAddress}${encodedAmount}`
  }

  supportedNetworks: Network[] = [
    Network.ARBITRUM_ONE,
    Network.AVALANCHE_C,
    Network.CELO,
    Network.CELO_ALFAJORES,
    Network.CHILIZ,
    Network.ETHEREUM,
    Network.ETHEREUM_SEPOLIA,
    Network.ETHEREUM_GOERLI,
    Network.ETHEREUM_HOLESKY,
    Network.ETHEREUM_CLASSIC,
    Network.POLYGON,
    Network.POLYGON_MUMBAI,
    Network.BINANCE_SMART_CHAIN,
    Network.BINANCE_SMART_CHAIN_TESTNET,
    Network.OPTIMISM,
    Network.OPTIMISM_TESTNET,
  ]
}
