import { ITatumSdkContainer, Network, TatumConfig, TatumSdkWalletProvider } from '@tatumio/tatum'
import { BIP32Factory } from 'bip32'
import { generateMnemonic as bip39GenerateMnemonic, mnemonicToSeed } from 'bip39'
import { payments } from 'bitcoinjs-lib'
import ECPairFactory from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import {UtxoTxPayload, UtxoWallet, XpubWithMnemonic} from './types'
import { getDefaultDerivationPath, getNetworkConfig } from './utils'

const ECPair = ECPairFactory(ecc)
const bip32 = BIP32Factory(ecc)

export class UtxoWalletProvider extends TatumSdkWalletProvider<UtxoWallet, UtxoTxPayload> {
  private readonly sdkConfig: TatumConfig
  //private readonly utxoRpc: UtxoRpc

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
    //this.utxoRpc = this.tatumSdkContainer.get(UtxoRpc)
  }

  /**
   * Generates a mnemonic seed phrase.
   * @returns {string} A mnemonic seed phrase.
   */
  public generateMnemonic(): string {
    return bip39GenerateMnemonic(256)
  }

  /**
   * Generates an extended public key (xpub) based on a mnemonic and a derivation path.
   * If no mnemonic is provided, it is generated.
   * If no derivation path is provided, default is used.
   * @param {string} [mnemonic] - The mnemonic seed phrase.
   * @param {string} [path] - The derivation path.
   * @returns {XpubWithMnemonic} An object containing xpub, mnemonic, and derivation path.
   */
  public async generateXpub(mnemonic?: string, path?: string): Promise<XpubWithMnemonic> {
    mnemonic = mnemonic || this.generateMnemonic()
    path = path || getDefaultDerivationPath(this.sdkConfig.network)

    const xpub = bip32
      .fromSeed(await mnemonicToSeed(mnemonic), getNetworkConfig(this.sdkConfig.network))
      .derivePath(path)
      .neutered()
      .toBase58()

    return {
      xpub: xpub,
      mnemonic,
      derivationPath: path,
    } as XpubWithMnemonic
  }

  /**
   * Generates a private key based on a mnemonic, index, and a derivation path.
   * If no derivation path is provided, default is used.
   * @param {string} mnemonic - The mnemonic seed phrase.
   * @param {number} index - The index to derive the private key from.
   * @param {string} [path] - The derivation path.
   * @returns {string} A private key in string format.
   */
  public async generatePrivateKeyFromMnemonic(
    mnemonic: string,
    index: number,
    path?: string,
  ): Promise<string> {
    return bip32
      .fromSeed(await mnemonicToSeed(mnemonic), getNetworkConfig(this.sdkConfig.network))
      .derivePath(path || getDefaultDerivationPath(this.sdkConfig.network))
      .derive(index)
      .toWIF()
  }

  /**
   * Generates an address based on a mnemonic, index, and a derivation path.
   * If no derivation path is provided, default is used.
   * @param {string} mnemonic - The mnemonic seed phrase.
   * @param {number} index - The index to derive the address from.
   * @param {string} [path] - The derivation path.
   * @returns {string} An Ethereum address in string format.
   */
  public async generateAddressFromMnemonic(mnemonic: string, index: number, path?: string): Promise<string> {
    const pubkey = bip32
      .fromSeed(await mnemonicToSeed(mnemonic), getNetworkConfig(this.sdkConfig.network))
      .derivePath(path || getDefaultDerivationPath(this.sdkConfig.network))
      .derive(index).publicKey
    return payments.p2pkh({ pubkey, network: getNetworkConfig(this.sdkConfig.network) }).address as string
  }

  /**
   * Generates an address from an extended public key (xpub) and an index.
   * @param {string} xpub - The extended public key.
   * @param {number} index - The index to derive the address from.
   * @returns {string} An Ethereum address in string format.
   */
  public generateAddressFromXpub(xpub: string, index: number): string {
    const pubkey = bip32
      .fromBase58(xpub, getNetworkConfig(this.sdkConfig.network))
      .derivePath(String(index)).publicKey
    return payments.p2pkh({ pubkey, network: getNetworkConfig(this.sdkConfig.network) }).address as string
  }

  /**
   * Generates an address from a given private key.
   * @param {string} privateKey - The private key in string format.
   * @returns {string} An Ethereum address in string format.
   */
  public generateAddressFromPrivateKey(privateKey: string): string {
    const pubkey = ECPair.fromWIF(privateKey, getNetworkConfig(this.sdkConfig.network)).publicKey
    return payments.p2pkh({ pubkey, network: getNetworkConfig(this.sdkConfig.network) }).address as string
  }

  /**
   * Generates an EVM-compatible wallet, which includes an address, private key, and a mnemonic.
   * @returns {UtxoWallet} An object containing address, private key, and mnemonic.
   */
  public async getWallet(): Promise<UtxoWallet> {
    const mnemonic = this.generateMnemonic()
    const privateKey = await this.generatePrivateKeyFromMnemonic(mnemonic, 0)
    const address = this.generateAddressFromPrivateKey(privateKey)

    return { address, privateKey, mnemonic } as UtxoWallet
  }

  /**
   * Signs and broadcasts an EVM transaction payload.
   * @param {UtxoTxPayload} payload - The EVM transaction payload, which includes private key and transaction details.
   * @returns {Promise<string>} A promise that resolves to the transaction hash.
   */
  public async signAndBroadcast(payload: UtxoTxPayload): Promise<string> {
    const { privateKey, ...tx } = payload
    console.log(tx)
    return ''
  }

  supportedNetworks: Network[] = [
    Network.BITCOIN,
    Network.DOGECOIN,
    Network.LITECOIN,
    Network.BITCOIN_CASH,
    Network.BITCOIN_TESTNET,
    Network.DOGECOIN_TESTNET,
    Network.LITECOIN_TESTNET,
    Network.BITCOIN_CASH_TESTNET,
  ]
}
