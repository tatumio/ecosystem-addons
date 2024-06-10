import { BuiltInPredicate } from "@kadena/client";

export interface KadenaGuard {
  account: string
  keyset: {
    keys: string[]
    pred: BuiltInPredicate
  }
}

export enum KadenaNetworkId {
  MAINNET = 'mainnet01',
  TESTNET = 'testnet04'
}
