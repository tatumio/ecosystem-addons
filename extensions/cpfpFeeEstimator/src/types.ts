import BigNumber from 'bignumber.js'

export interface TxIn {
  txid: string
  vout: number
}

export interface TxOut {
  value: BigNumber
}

export interface Transaction {
  txid: string
  size: number
  fee: BigNumber
  vin: TxIn[]
  vout: TxOut[]
  confirmations: number
}

export enum FeeTransactionSpeed {
  SLOW = 'slow',
  MEDIUM = 'medium',
  FAST = 'fast',
}
