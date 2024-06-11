import { BuiltInPredicate, ChainId } from '@kadena/client'

export interface KadenaGuard {
  account: string
  keyset: {
    keys: string[]
    pred: BuiltInPredicate
  }
}

export interface KadenaTransferParams {
  senderAccount: string
  receiverAccount: string
  amount: string
  senderPublicKey: string
  chainId: ChainId
}

export enum KadenaNetworkId {
  MAINNET = 'mainnet01',
  TESTNET = 'testnet04',
}
