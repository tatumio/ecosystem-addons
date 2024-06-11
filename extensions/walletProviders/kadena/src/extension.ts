import { ChainId, ICommand, createClient, createSignWithKeypair } from '@kadena/client'
import { restoreKeyPairFromSecretKey } from '@kadena/cryptography-utils'
import { genKeyPair } from '@kadena/cryptography-utils/lib/genKeyPair'
import { ICommandPayload } from '@kadena/types'
import { ITatumSdkContainer, Network, TatumConfig, TatumSdkWalletProvider } from '@tatumio/tatum'
import { KadenaLoadBalancerRpc } from '@tatumio/tatum/dist/src/service/rpc/other/KadenaLoadBalancerRpc'
import { KadenaNetworkId, KadenaTxPayload, KadenaTxPayloadList, KadenaWallet } from './types'

export class KadenaWalletProvider extends TatumSdkWalletProvider<KadenaWallet, KadenaTxPayload> {
  private readonly kadenaRpc: KadenaLoadBalancerRpc
  private readonly sdkConfig: TatumConfig

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
    this.kadenaRpc = this.tatumSdkContainer.get(KadenaLoadBalancerRpc)
  }

  /**
   * Gets a Kadena wallet, which includes an address, secret key, and a public key.
   * @returns {KadenaWallet} An object containing address, secret key, and public key.
   */
  public async getWallet() {
    const keyPair = genKeyPair()
    const address = 'k:' + keyPair.publicKey

    return { address, publicKey: keyPair.publicKey, secretKey: keyPair.secretKey } as KadenaWallet
  }

  /**
   * Signs a Kadena transaction payload.
   * @param {KadenaTxPayload} txPayload - The Kadena transaction payload, which includes secret key and transaction details.
   * @returns {Promise<ICommand>} A promise that resolves to the signed transaction payload.
   */
  public async sign(txPayload: KadenaTxPayload): Promise<ICommand> {
    const keyPair = restoreKeyPairFromSecretKey(txPayload.secretKey)
    const signWithKeypair = createSignWithKeypair(keyPair)

    const signedCommand = await signWithKeypair(txPayload.command)
    return signedCommand as ICommand
  }

  /**
   * Signs and broadcasts a Kadena transaction payload.
   * @param {KadenaTxPayload} txPayload - The Kadena transaction payload, which includes secret key and transaction details.
   * @returns {Promise<string>} A promise that resolves to the transaction hash.
   */
  public async signAndBroadcast(txPayload: KadenaTxPayload): Promise<string> {
    const payload: ICommandPayload = JSON.parse(txPayload.command.cmd)
    const chainId = payload.meta?.chainId

    if (!chainId) {
      throw new Error('Chain ID is required to broadcast a Kadena transaction.')
    }

    const { client } = this.getTatumKadenaClient(chainId)

    const signedCommand = await this.sign(txPayload)
    const result = await client.submit(signedCommand)
    return result.requestKey
  }

  /**
   * Signs and broadcasts multiple Kadena transaction payloads.
   * @param {KadenaTxPayloadList} txPayloadList - The list of Kadena transaction payloads, which include secret key and transaction details.
   * @returns {Promise<string[]>} A promise that resolves to the list of transaction hashes.
   */
  public async signAndBroadcastMultiple(txPayloadList: KadenaTxPayloadList): Promise<string[]> {
    const signedCommandPromises: Promise<ICommand>[] = []

    for (const txPayload of txPayloadList.txPayloads) {
      const payload: ICommandPayload = JSON.parse(txPayload.command.cmd)

      if (txPayloadList.chainId !== payload.meta?.chainId) {
        throw new Error(
          `Chain ID needs to be ${txPayloadList.chainId} for each Kadena transaction in a single batch.`,
        )
      }

      signedCommandPromises.push(this.sign(txPayload))
    }

    const { client } = this.getTatumKadenaClient(txPayloadList.chainId)
    const signedCommands = await Promise.all(signedCommandPromises)

    const results = await client.submit(signedCommands)
    return results.map((result) => result.requestKey)
  }

  private getTatumKadenaClient(chainId: ChainId) {
    const networkId = this.getKadenaNetworkId()
    const nodeUrl = this.kadenaRpc.getRpcNodeUrl()
    const host = `${nodeUrl}/chainweb/0.0/${networkId}/chain/${chainId}/pact`
    const client = createClient(host)
    return { networkId, client }
  }

  private getKadenaNetworkId() {
    let networkId: KadenaNetworkId
    switch (this.sdkConfig.network) {
      case Network.KADENA:
        networkId = KadenaNetworkId.MAINNET
        break
      case Network.KADENA_TESTNET:
        networkId = KadenaNetworkId.TESTNET
        break
      default:
        throw new Error(`Unsupported network: ${this.sdkConfig.network}`)
    }
    return networkId
  }

  supportedNetworks: Network[] = [Network.KADENA, Network.KADENA_TESTNET]
}
