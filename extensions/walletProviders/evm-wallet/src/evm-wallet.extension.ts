import { TatumConfig, ITatumSdkContainer, TatumSdkWalletProvider } from '@tatumio/tatum'
import ethWallet, { hdkey } from 'ethereumjs-wallet'
import { generateMnemonic as bip39GenerateMnemonic } from 'bip39'

import {
  ADDR_PREFIX,
  EvmWallet,
  getDefaultDerivationPath,
  getHd,
  getWalletFromHd,
  TxPayload,
  XpubWithMnemonic,
} from './evm-wallet.utils'

export class EvmWalletService extends TatumSdkWalletProvider<EvmWallet, TxPayload> {
  private readonly sdkConfig: TatumConfig

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
  }

  public generateMnemonic() {
    return bip39GenerateMnemonic(256)
  }

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

  public async generatePrivateKeyFromMnemonic(mnemonic: string, index: number, path?: string) {
    const hd = await getHd(mnemonic, path || getDefaultDerivationPath(this.sdkConfig.network))
    const wallet = getWalletFromHd(hd, index)

    return wallet.getPrivateKeyString()
  }

  public async generateAddressFromMnemonic(mnemonic: string, index: number, path?: string) {
    const hd = await getHd(mnemonic, path || getDefaultDerivationPath(this.sdkConfig.network))
    const wallet = getWalletFromHd(hd, index)

    return wallet.getAddressString()
  }

  public generateAddressFromXpub(xpub: string, index: number) {
    const hd = hdkey.fromExtendedKey(xpub)
    const wallet = getWalletFromHd(hd, index)

    return wallet.getAddressString()
  }

  public generateAddressFromPrivateKey(privateKey: string) {
    const wallet = ethWallet.fromPrivateKey(Buffer.from(privateKey.replace(ADDR_PREFIX, ''), 'hex'))

    return wallet.getAddressString()
  }

  public async getWallet() {
    const mnemonic = this.generateMnemonic()
    const privateKey = await this.generatePrivateKeyFromMnemonic(mnemonic, 0)
    const address = this.generateAddressFromPrivateKey(privateKey)

    return { address, privateKey, mnemonic } as EvmWallet
  }

  public async signAndBroadcast(payload: TxPayload): Promise<string> {
    // TODO: Replace with proper implementation
    console.log(payload)
    return 'TxId'
  }

  init(): Promise<void> {
    console.log(`[EvmWalletExtension] initialised`)
    return Promise.resolve(undefined)
  }

  destroy(): void {
    console.log(`[EvmWalletExtension] disposed`)
  }
}
