import { InMemorySigner } from '@taquito/signer'
import { TezosToolkit } from '@taquito/taquito'
import { ITatumSdkContainer, Network, TatumSdkWalletProvider } from '@tatumio/tatum'
import { generateMnemonic } from 'bip39'
import { cryptoUtils } from 'sotez'
import { TEZOS_DERIVATION_PATH } from './consts'
import { TezosTxPayload, TezosWallet } from './types'

export class TezosWalletProvider extends TatumSdkWalletProvider<TezosWallet, TezosTxPayload> {
  constructor(tatumSdkContainer: ITatumSdkContainer, private readonly config: { rpcUrl: string }) {
    super(tatumSdkContainer)
  }

  /**
   * Generates a mnemonic seed phrase.
   * @returns {string} A mnemonic seed phrase.
   */
  generateMnemonic(): string {
    return generateMnemonic(256)
  }
  /**
   * Generates a private key and address based on a mnemonic and a derivation path.
   * If no derivation path is provided, default is used.
   * @param {string} mnemonic - The mnemonic seed phrase.
   * @param {string} [path] - The derivation path.
   * @returns {{privateKey: string, publicKey: string, address: string}} A private key and address in a string format.
   */
  public async generatePrivateAndPublicKeyFromMnemonic(mnemonic: string, path?: string) {
    path = path || TEZOS_DERIVATION_PATH
    const { sk: privateKey, pkh: address } = await cryptoUtils.generateKeys(mnemonic, undefined, path)

    return { privateKey, address }
  }

  /**
   * Generates an address from a given private key.
   * @param {string} privateKey - The private key in string format.
   * @returns {string} An address in string format.
   */
  public async getPublicKeyFromPrivateKey(privateKey: string) {
    const { pkh: address } = await cryptoUtils.extractKeys(privateKey)

    return address
  }

  /**
   * Generates a Tezos wallet, which includes an address, private key, and a mnemonic.
   * @returns {TezosWallet} An object containing address, private key, and mnemonic.
   */
  public async getWallet() {
    const mnemonic = this.generateMnemonic()

    const { privateKey, address } = await this.generatePrivateAndPublicKeyFromMnemonic(mnemonic)

    return { address, privateKey, mnemonic } as TezosWallet
  }

  /**
   * Signs and broadcasts a Tezos transaction payload.
   * @param {EvmTxPayload} payload - The Tezos transaction payload, which includes private key and transaction details.
   * @returns {Promise<string>} A promise that resolves to the transaction hash.
   */
  public async signAndBroadcast(payload: TezosTxPayload): Promise<string> {
    const Tezos = new TezosToolkit(this.config.rpcUrl)
    const memorySigner = new InMemorySigner(payload.privateKey)

    Tezos.setSignerProvider(memorySigner)

    const { hash } = await Tezos.contract.transfer({ to: payload.to, amount: payload.amount })

    return hash
  }

  supportedNetworks: Network[] = [Network.TEZOS, Network.TEZOS_TESTNET]
}
