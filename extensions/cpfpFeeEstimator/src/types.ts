import BigNumber from 'bignumber.js'

export interface TxIn {
  txid: string
  vout: number
}

export interface TxOut {
  value: BigNumber
  address: string
}

export interface Transaction {
  txid: string
  size: number
  fee: BigNumber
  feePerByte: BigNumber
  vin: TxIn[]
  vout: TxOut[]
  confirmations: number
}

export interface CPFPFeeEstimation {
  transactionsInChain: Transaction[]
  totalSizeBytes: number
  totalCurrentFee: string
  targetTransactionSpeed: FeeTransactionSpeed
  targetFeePerByte: string
  totalRequiredFee: string
  additionalFeeNeeded: string
}

export enum FeeTransactionSpeed {
  SLOW = 'slow',
  MEDIUM = 'medium',
  FAST = 'fast',
}
