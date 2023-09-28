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

export class EvmWalletService extends TatumSdkWalletProvider<EvmWallet, EvmTxPayload> {
  supportedNetworks: Network[] = EVM_BASED_NETWORKS
  private readonly sdkConfig: TatumConfig
  private readonly loadBalancer: LoadBalancer

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
    this.loadBalancer = this.tatumSdkContainer.get(LoadBalancer)
  }

  // TODO: Add comments and proper README

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
