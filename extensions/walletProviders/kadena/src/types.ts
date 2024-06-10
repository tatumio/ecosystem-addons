import { IUnsignedCommand } from "@kadena/client";

export type KadenaWallet = {
  address: string
  publicKey: string;
  secretKey: string;
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

export enum KadenaNetworkId {
  MAINNET = 'mainnet01',
  TESTNET = 'testnet04'
}
