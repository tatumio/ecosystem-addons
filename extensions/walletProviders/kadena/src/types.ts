import { ChainId, IUnsignedCommand } from '@kadena/client'

export type KadenaWallet = {
  address: string
  publicKey: string
  secretKey: string
}

export type KadenaTxPayload = {
  /**
   * Secret key of the address, from which the KDA will be sent.
   */
  secretKey: string
  /**
   * Unsigned command to be broadcasted.
   */
  command: IUnsignedCommand
}

export type KadenaTxPayloadList = {
  /**
   * Payloads with secret keys and transaction details.
   */
  txPayloads: KadenaTxPayload[]
  /**
   * ID of the chain.
   */
  chainId: ChainId
}

export enum KadenaNetworkId {
  MAINNET = 'mainnet01',
  TESTNET = 'testnet04',
}
