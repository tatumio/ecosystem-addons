import BigNumber from 'bignumber.js'

export type XpubWithMnemonic = {
  xpub: string
  mnemonic: string
  derivationPath: string
}

export type EvmWallet = {
  address: string
  privateKey: string
  mnemonic: string
}

export type EvmTxPayload = {
  privateKey: string
  type?: number
  to?: string
  nonce?: number
  gasLimit?: number | string
  gasPrice?: string
  maxPriorityFeePerGas?: string
  maxFeePerGas?: string
  data?: string
  value?: string
}

export type TransactionDetails = {
  from: string
  to: string
  value: number
  gasLimit: number
  gasPrice: number
}

export type TokenTransactionDetails = {
  from: string
  to: string
  tokenContractAddress: string
  data: string
  gasLimit: number
  gasPrice: number
}

export type BalanceChange = {
  from: BigNumber
  to: BigNumber
}

export type BalanceChanges = {
  [address: string]: BalanceChange
}

export interface SimulationResult {
  transactionDetails: TransactionDetails
  status: 'success' | 'failure' // assuming there's also a potential "failure" status
  error?: string
  balanceChanges: BalanceChanges
}

export interface TokenSimulationResult {
  transactionDetails: TokenTransactionDetails
  status: 'success' | 'failure' // assuming there's also a potential "failure" status
  error?: string
  balanceChanges: BalanceChanges
  tokenTransfers: TokenTransfers // You might want to specify a more detailed type for token transfers if known.
}

export interface Transfer {
  /**
   * Blockchain address to which the funds will be transferred.
   */
  to: string

  /**
   * Blockchain address from which the funds will be transferred.
   */
  from: string

  /**
   * Optional parameter specifying the gas limit for the transaction.
   */
  gas?: string

  /**
   * Optional parameter specifying the gas price for the transaction.
   */
  gasPrice?: string

  /**
   * Amount of native currency to be transferred, denoted in the smallest unit of the blockchain currency (e.g., Wei for Ethereum).
   */
  value: number
}

export interface TokenTransfer extends Transfer {
  /**
   * Amount of ERC20 tokens to be transferred.
   */
  value: number

  /**
   * Address of the ERC20 token contract for the token being transferred.
   */
  tokenContractAddress: string
}

export interface TransferPayload {
  to: string
  from: string
  gas?: string
  gasPrice?: string
  value: string
}

export interface TokenTransferPayload {
  to: string
  from: string
  gas?: string
  gasPrice?: string
  value: string
  data: string
}

export type TokenTransferDetail = {
  from: BigNumber
  to: BigNumber
}

export type TokenInfo = {
  name: string
  symbol: string
  decimals: number
  [address: string]: TokenTransferDetail | string | number
}

export type TokenTransfers = {
  [tokenAddress: string]: TokenInfo
}

export type TokenDetails = {
  decimals: BigNumber
  tokenName: string
  tokenSymbol: string
}

export type BalanceChangeDetail = {
  from: string
  to: string
}

export type AddressStateDiff = {
  balance: {
    '*': BalanceChangeDetail
  }
}

export type Trace = {
  trace: {
    [index: number]: {
      error?: string
    }
  }
  stateDiff: {
    [address: string]: AddressStateDiff
  }
}

export type BalanceDiff = {
  '*': {
    from: string
    to: string
  }
}

export type StorageDiff = {
  [key: string]: {
    '*': {
      from: string
      to: string
    }
  }
}

export type StateDiff = {
  [address: string]: {
    balance: BalanceDiff
    storage: StorageDiff
  }
}

export type TraceErc20 = {
  trace: {
    [index: number]: {
      error?: string
    }
  }
  stateDiff: StateDiff
}
