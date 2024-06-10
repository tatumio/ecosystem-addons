import { ITatumSdkContainer, Network, TatumSdkWalletProvider } from '@tatumio/tatum'
import { KadenaTxPayload, KadenaWallet } from './types'
import { genKeyPair } from "@kadena/cryptography-utils/lib/genKeyPair";
import { restoreKeyPairFromSecretKey } from "@kadena/cryptography-utils";
import { createClient, createSignWithKeypair, ICommand } from "@kadena/client";
import { ICommandPayload } from "@kadena/types";

export class KadenaWalletProvider extends TatumSdkWalletProvider<KadenaWallet, KadenaTxPayload> {
  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
  }

  /**
   * Gets a Kadena wallet, which includes an address, secret key, and a public key.
   * @returns {KadenaWallet} An object containing address, secret key, and public key.
   */
  public async getWallet() {
    const keyPair = genKeyPair()
    const address = 'k:' + keyPair.publicKey

    return { address, publicKey: keyPair.publicKey, secretKey: keyPair.secretKey} as KadenaWallet
  }

  /**
   * Signs and broadcasts a Kadena transaction payload.
   * @param {KadenaTxPayload} txPayload - The Kadena transaction payload, which includes secret key and transaction details.
   * @returns {Promise<string>} A promise that resolves to the transaction hash.
   */
  public async signAndBroadcast(txPayload: KadenaTxPayload): Promise<string> {
    const keyPair = restoreKeyPairFromSecretKey(txPayload.secretKey)
    const signWithKeypair = createSignWithKeypair(keyPair)
    const payload: ICommandPayload = JSON.parse(txPayload.command.cmd)

    const networkId = payload.networkId
    const chainId = payload.meta.chainId

    if(!networkId || !chainId)
    {
      throw new Error('Network ID and Chain ID are required to sign and broadcast a Kadena transaction.')
    }

    const host = `https://api.testnet.chainweb.com/chainweb/0.0/${networkId}/chain/${chainId}/pact`
    const client = createClient(host);

    const signedCommand = await signWithKeypair(txPayload.command);
    const result = await client.submit(signedCommand as ICommand)
    return result.requestKey
  }

  supportedNetworks: Network[] = [Network.KADENA, Network.KADENA_TESTNET]
}
