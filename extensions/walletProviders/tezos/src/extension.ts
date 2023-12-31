import { InMemorySigner } from '@taquito/signer'
import { TezosToolkit } from '@taquito/taquito'
import { ITatumSdkContainer, Network, TatumSdkWalletProvider } from '@tatumio/tatum'
import { TezosRpcInterface } from '@tatumio/tatum/dist/src/dto/rpc/TezosRpcSuite'
import { generateMnemonic } from 'bip39'
import { cryptoUtils } from 'sotez'
import { TEZOS_DERIVATION_PATH } from './consts'
import { TatumProvider } from './tatum.provider'
import { TezosTxPayload, TezosWallet } from './types'

export class TezosWalletProvider extends TatumSdkWalletProvider<TezosWallet, TezosTxPayload> {
  private readonly rpc: TezosRpcInterface
  private readonly chain: string

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.rpc = this.tatumSdkContainer.getRpc<TezosRpcInterface>() as TezosRpcInterface
    this.chain = 'main'
  }

  /**
   * Generates a mnemonic seed phrase.
   * @returns {string} A mnemonic seed phrase.
   */
  generateMnemonic(): string {
    return generateMnemonic(256)
  }
  /**
   * Generates a private key based on a mnemonic and a derivation path.
   * If no derivation path is provided, default is used.
   * @param {string} mnemonic - The mnemonic seed phrase.
   * @param {string} [path] - The derivation path.
   * @returns {string} A private key in a string format.
   */
  public async generatePrivateKeyFromMnemonic(mnemonic: string, path?: string) {
    path = path || TEZOS_DERIVATION_PATH
    const { sk: privateKey } = await cryptoUtils.generateKeys(mnemonic, undefined, path)

    return privateKey
  }

  /**
   * Generates an address from a given private key.
   * @param {string} privateKey - The private key in string format.
   * @returns {string} An address in string format.
   */
  public async generateAddressFromPrivateKey(privateKey: string) {
    const { pkh: address } = await cryptoUtils.extractKeys(privateKey)

    return address
  }

  /**
   * Gets a Tezos wallet, which includes an address, private key, and a mnemonic.
   * @returns {TezosWallet} An object containing address, private key, and mnemonic.
   */
  public async getWallet() {
    const mnemonic = this.generateMnemonic()

    const privateKey = await this.generatePrivateKeyFromMnemonic(mnemonic)

    const address = await this.generateAddressFromPrivateKey(privateKey)

    return { address, privateKey, mnemonic } as TezosWallet
  }

  /**
   * Signs and broadcasts a Tezos transaction payload.
   * @param {TezosTxPayload} payload - The Tezos transaction payload, which includes private key and transaction details.
   * @returns {Promise<string>} A promise that resolves to the transaction hash.
   */
  public async signAndBroadcast(payload: TezosTxPayload): Promise<string> {
    const tezos = new TezosToolkit(new TatumProvider(this.rpc, this.chain))

    tezos.setProvider({
      signer: await InMemorySigner.fromSecretKey(payload.privateKey),
    })

    const op = await tezos.contract.transfer({
      to: payload.to,
      amount: payload.amount,
    })

    return op.hash
  }

  supportedNetworks: Network[] = [Network.TEZOS, Network.TEZOS_TESTNET]
}
