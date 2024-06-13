import { BuiltInPredicate, ChainId } from '@kadena/client'

export type KadenaChainId = ChainId

export enum KadenaNetworkId {
  MAINNET = 'mainnet01',
  TESTNET = 'testnet04',
}

export interface KadenaGuard {
  account: string
  keyset: {
    keys: string[]
    pred: BuiltInPredicate
  }
}

export interface KadenaTransferParams {
  senderAccount: string
  receiverPublicKey: string
  senderPublicKey: string
  amount: string
  chainId: KadenaChainId
}
