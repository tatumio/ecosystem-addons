import { EvmRpc, ITatumSdkContainer, Network, TatumConfig, TatumSdkWalletProvider } from '@tatumio/tatum'
import { generateMnemonic as bip39GenerateMnemonic } from 'bip39'
import ethWallet, { hdkey } from 'ethereumjs-wallet'
import { Transaction, ethers } from 'ethers'

import { ADDR_PREFIX, NETWORK_CHAIN_IDS } from './consts'
import { TatumProvider } from './tatum.provider'
import { EvmTxPayload, EvmWallet, XpubWithMnemonic } from './types'
import { getDefaultDerivationPath, getHd, getWalletFromHd } from './utils'

export class EvmWalletProvider extends TatumSdkWalletProvider<EvmWallet, EvmTxPayload> {
  private readonly sdkConfig: TatumConfig
  private readonly evmRpc: EvmRpc

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
    this.evmRpc = this.tatumSdkContainer.get(EvmRpc)
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

    const chainId = NETWORK_CHAIN_IDS.get(this.sdkConfig.network) as number
    const provider = new TatumProvider(chainId, this.evmRpc)
    const signer = new ethers.Wallet(privateKey, provider)
    const txRequest = {
      ...tx,
      value: payload.value && ethers.parseEther(payload.value),
      gasPrice: payload.gasPrice && ethers.parseUnits(payload.gasPrice, 'gwei'),
      maxPriorityFeePerGas:
        payload.maxPriorityFeePerGas && ethers.parseUnits(payload.maxPriorityFeePerGas, 'gwei'),
      maxFeePerGas: payload.maxFeePerGas && ethers.parseUnits(payload.maxFeePerGas, 'gwei'),
    }
    const pop = await signer.populateTransaction(txRequest)
    delete pop.from
    const txObj = Transaction.from(pop)
    const signedTransaction = await signer.signTransaction(txObj)
    const txResponse = await this.evmRpc.sendRawTransaction(signedTransaction)
    provider.destroy()

    if (!txResponse?.result) {
      throw Error(JSON.stringify(txResponse.error))
    }

    return txResponse.result
  }

  supportedNetworks: Network[] = [
    Network.ETHEREUM,
    Network.ETHEREUM_SEPOLIA,
    Network.ETHEREUM_CLASSIC,
    Network.ETHEREUM_GOERLI,
    Network.AVALANCHE_C,
    Network.AVALANCHE_C_TESTNET,
    Network.POLYGON,
    Network.POLYGON_MUMBAI,
    Network.GNOSIS,
    Network.GNOSIS_TESTNET,
    Network.FANTOM,
    Network.FANTOM_TESTNET,
    Network.AURORA,
    Network.AURORA_TESTNET,
    Network.CELO,
    Network.CELO_ALFAJORES,
    Network.BINANCE_SMART_CHAIN_TESTNET,
    Network.VECHAIN,
    Network.VECHAIN_TESTNET,
    Network.XDC,
    Network.XDC_TESTNET,
    Network.PALM,
    Network.PALM_TESTNET,
    Network.CRONOS,
    Network.CRONOS_TESTNET,
    Network.KUCOIN,
    Network.KUCOIN_TESTNET,
    Network.OASIS,
    Network.OASIS_TESTNET,
    Network.OPTIMISM,
    Network.OPTIMISM_TESTNET,
    Network.HARMONY_ONE_SHARD_0,
    Network.HARMONY_ONE_TESTNET_SHARD_0,
    Network.KLAYTN,
    Network.KLAYTN_BAOBAB,
    Network.FLARE_COSTON,
    Network.FLARE_COSTON_2,
    Network.FLARE,
    Network.FLARE_SONGBIRD,
    Network.HAQQ,
    Network.HAQQ_TESTNET,
    Network.ARBITRUM_NOVA,
    Network.ARBITRUM_NOVA_TESTNET,
    Network.ARBITRUM_ONE,
    Network.BINANCE_SMART_CHAIN,
    Network.HORIZEN_EON,
    Network.HORIZEN_EON_GOBI,
    Network.CHILIZ,
  ]
}
