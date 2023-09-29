import {
  EVM_BASED_NETWORKS,
  ITatumSdkContainer,
  LoadBalancer,
  Network,
  RpcNodeType,
  TatumConfig,
  TatumSdkWalletProvider,
} from '@tatumio/tatum'
import { generateMnemonic as bip39GenerateMnemonic } from 'bip39'
import ethWallet, { hdkey } from 'ethereumjs-wallet'
import { ethers } from 'ethers'

import { ADDR_PREFIX } from './consts'
import { EvmTxPayload, EvmWallet, XpubWithMnemonic } from './types'
import { getHd, getWalletFromHd, getDefaultDerivationPath } from './utils'

export class EvmWalletProvider extends TatumSdkWalletProvider<EvmWallet, EvmTxPayload> {
  supportedNetworks: Network[] = EVM_BASED_NETWORKS
  private readonly sdkConfig: TatumConfig
  private readonly loadBalancer: LoadBalancer

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
    this.loadBalancer = this.tatumSdkContainer.get(LoadBalancer)
  }

  /**
   * Generates a mnemonic seed phrase.
   * @returns {string} A mnemonic seed phrase.
   */
  public generateMnemonic() {
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
  public async generateXpub(mnemonic?: string, path?: string) {
    mnemonic = mnemonic || this.generateMnemonic()
    path = path || getDefaultDerivationPath(this.sdkConfig.network)
    const hd = await getHd(mnemonic, path)

    return {
      xpub: hd.publicExtendedKey().toString(),
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
  public async generatePrivateKeyFromMnemonic(mnemonic: string, index: number, path?: string) {
    const hd = await getHd(mnemonic, path || getDefaultDerivationPath(this.sdkConfig.network))
    const wallet = getWalletFromHd(hd, index)

    return wallet.getPrivateKeyString()
  }

  /**
   * Generates an address based on a mnemonic, index, and a derivation path.
   * If no derivation path is provided, default is used.
   * @param {string} mnemonic - The mnemonic seed phrase.
   * @param {number} index - The index to derive the address from.
   * @param {string} [path] - The derivation path.
   * @returns {string} An Ethereum address in string format.
   */
  public async generateAddressFromMnemonic(mnemonic: string, index: number, path?: string) {
    const hd = await getHd(mnemonic, path || getDefaultDerivationPath(this.sdkConfig.network))
    const wallet = getWalletFromHd(hd, index)

    return wallet.getAddressString()
  }

  /**
   * Generates an address from an extended public key (xpub) and an index.
   * @param {string} xpub - The extended public key.
   * @param {number} index - The index to derive the address from.
   * @returns {string} An Ethereum address in string format.
   */
  public generateAddressFromXpub(xpub: string, index: number) {
    const hd = hdkey.fromExtendedKey(xpub)
    const wallet = getWalletFromHd(hd, index)

    return wallet.getAddressString()
  }

  /**
   * Generates an address from a given private key.
   * @param {string} privateKey - The private key in string format.
   * @returns {string} An Ethereum address in string format.
   */
  public generateAddressFromPrivateKey(privateKey: string) {
    const wallet = ethWallet.fromPrivateKey(Buffer.from(privateKey.replace(ADDR_PREFIX, ''), 'hex'))

    return wallet.getAddressString()
  }

  /**
   * Generates an EVM-compatible wallet, which includes an address, private key, and a mnemonic.
   * @returns {EvmWallet} An object containing address, private key, and mnemonic.
   */
  public async getWallet() {
    const mnemonic = this.generateMnemonic()
    const privateKey = await this.generatePrivateKeyFromMnemonic(mnemonic, 0)
    const address = this.generateAddressFromPrivateKey(privateKey)

    return { address, privateKey, mnemonic } as EvmWallet
  }

  /**
   * Signs and broadcasts an EVM transaction payload.
   * @param {EvmTxPayload} payload - The EVM transaction payload, which includes private key and transaction details.
   * @returns {Promise<string>} A promise that resolves to the transaction hash.
   */
  public async signAndBroadcast(payload: EvmTxPayload): Promise<string> {
    const { privateKey, ...tx } = payload

    const rpcNode = this.loadBalancer.getActiveUrl(RpcNodeType.NORMAL)
    const provider = new ethers.JsonRpcProvider(rpcNode.url)
    const signer = new ethers.Wallet(privateKey, provider)

    const txRequest = {
      ...tx,
      value: payload.value && ethers.parseEther(payload.value),
      gasPrice: payload.gasPrice && ethers.parseUnits(payload.gasPrice, 'gwei'),
      maxPriorityFeePerGas:
        payload.maxPriorityFeePerGas && ethers.parseUnits(payload.maxPriorityFeePerGas, 'gwei'),
      maxFeePerGas: payload.maxFeePerGas && ethers.parseUnits(payload.maxFeePerGas, 'gwei'),
    }

    const txResponse = await signer.sendTransaction(txRequest)

    return txResponse.hash
  }
}
