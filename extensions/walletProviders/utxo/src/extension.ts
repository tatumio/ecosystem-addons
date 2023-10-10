import {
  ITatumSdkContainer,
  Network,
  TatumConfig,
  TatumConnector,
  TatumSdkWalletProvider,
  UtxoRpc,
} from '@tatumio/tatum'
import BigNumber from 'bignumber.js'
import { BIP32Factory } from 'bip32'
import { generateMnemonic as bip39GenerateMnemonic, mnemonicToSeed } from 'bip39'
import { payments } from 'bitcoinjs-lib'
import { PrivateKey, Script, Transaction } from 'bitcore-lib'
import ECPairFactory from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import {
  BtcBasedTransaction,
  BtcTransactionFromAddress, BtcTransactionFromAddressSource,
  BtcTransactionFromUTXO,
  BtcUTXO,
  FeeBtcBased, UtxoResponse,
  UtxoTxPayload,
  UtxoWallet,
  XpubWithMnemonic,
} from './types'
import { fromSatoshis, getDefaultDerivationPath, getNetworkConfig, toSatoshis } from './utils'

const ECPair = ECPairFactory(ecc)
const bip32 = BIP32Factory(ecc)

export class UtxoWalletProvider extends TatumSdkWalletProvider<UtxoWallet, UtxoTxPayload> {
  private readonly sdkConfig: TatumConfig
  private readonly connector: TatumConnector
  private readonly utxoRpc: UtxoRpc

  constructor(tatumSdkContainer: ITatumSdkContainer, private readonly config: { skipAllChecks: boolean }) {
    super(tatumSdkContainer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
    this.connector = this.tatumSdkContainer.get(TatumConnector)
    this.utxoRpc = this.tatumSdkContainer.get(UtxoRpc)
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
   * @returns {string} An address in string format.
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
   * @returns {string} An address in string format.
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
   * Generates an UTXO-compatible wallet, which includes an address, private key, and a mnemonic.
   * @returns {UtxoWallet} An object containing address, private key, and mnemonic.
   */
  public async getWallet(): Promise<UtxoWallet> {
    const mnemonic = this.generateMnemonic()
    const privateKey = await this.generatePrivateKeyFromMnemonic(mnemonic, 0)
    const address = this.generateAddressFromPrivateKey(privateKey)

    return { address, privateKey, mnemonic } as UtxoWallet
  }

  /**
   * Signs and broadcasts an UTXO transaction payload.
   * @param {UtxoTxPayload} payload - The UTXO transaction payload, which includes private keys and transaction details.
   * @returns {Promise<string>} A promise that resolves to the transaction hash.
   */
  public async signAndBroadcast(payload: UtxoTxPayload): Promise<string> {
    const tx: BtcBasedTransaction = new Transaction()
    let privateKeysToSign: string[] = []

    if (payload.changeAddress) {
      tx.change(payload.changeAddress)
    }
    if (payload.fee) {
      tx.fee(toSatoshis(payload.fee))
    }
    payload.to.forEach((to) => {
      tx.to(to.address, toSatoshis(to.value))
    })

    if ('fromAddress' in payload) {
      privateKeysToSign = await this.privateKeysFromAddress(tx, payload)
    } else if ('fromUTXO' in payload) {
      privateKeysToSign = await this.privateKeysFromUTXO(tx, payload)
    }

    new Set(privateKeysToSign).forEach((key) => {
      tx.sign(new PrivateKey(key))
    })

    const rawTransaction = tx.serialize(this.config?.skipAllChecks)

    const response = await this.utxoRpc.sendRawTransaction(rawTransaction)

    if (!response?.result) {
      throw new Error(JSON.stringify(response.error))
    }

    return response.result
  }

  supportedNetworks: Network[] = [
    Network.BITCOIN,
    Network.DOGECOIN,
    Network.LITECOIN,
    Network.BITCOIN_TESTNET,
    Network.DOGECOIN_TESTNET,
    Network.LITECOIN_TESTNET,
  ]

  private async privateKeysFromAddress(
    transaction: BtcBasedTransaction,
    body: BtcTransactionFromAddress,
  ): Promise<Array<string>> {
    if (body.fromAddress.length === 0 && !this.config?.skipAllChecks) {
      throw new Error('No fromAddress provided')
    }

    let totalInputs = 0
    let totalOutputs = body.fee ? toSatoshis(body.fee) : 0
    for (const item of transaction.outputs) {
      totalOutputs += item.satoshis
    }
    const privateKeysToSign: string[] = []

    for (const item of body.fromAddress) {
      if (totalInputs >= totalOutputs) {
        break
      }

      const utxos = await this.getUtxos(item, totalOutputs, totalInputs)
      for (const utxo of utxos) {
        totalInputs += utxo.value
        transaction.from([
          Transaction.UnspentOutput.fromObject({
            txId: utxo.txHash,
            outputIndex: utxo.index,
            script: Script.fromAddress(utxo.address).toString(),
            satoshis: toSatoshis(utxo.value),
          }),
        ])

        privateKeysToSign.push(item.privateKey)
      }
    }

    return privateKeysToSign
  }

  private async getUtxos(item: BtcTransactionFromAddressSource, totalOutputs: number, totalInputs: number) {
    return this.connector.get<UtxoResponse>({
      path: `/v3/data/utxos?chain=${this.sdkConfig.network}&address=${
          item.address
      }&totalValue=${fromSatoshis(totalOutputs - totalInputs)}`,
    })
  }

  private async privateKeysFromUTXO(
    transaction: Transaction,
    body: BtcTransactionFromUTXO,
  ): Promise<Array<string>> {
    if (body.fromUTXO.length === 0 && !this.config?.skipAllChecks) {
      throw new Error('No fromUTXO provided')
    }

    const privateKeysToSign: string[] = []
    const utxos: BtcUTXO[] = []

    const filteredUtxos = await this.getUtxoBatch(body)

    for (let i = 0; i < filteredUtxos.length; i++) {
      const utxo = filteredUtxos[i]
      if (utxo === null || !utxo.address) continue

      const utxoItem = body.fromUTXO[i]

      utxos.push(utxo)

      transaction.from([
        Transaction.UnspentOutput.fromObject({
          txId: utxo.hash,
          outputIndex: utxo.index,
          script: Script.fromAddress(utxo.address).toString(),
          satoshis: utxo.value,
        }),
      ])

      privateKeysToSign.push(utxoItem.privateKey)
    }

    if (!this.config?.skipAllChecks) {
      await this.validateBalanceFromUTXO(body, utxos)
    }

    return privateKeysToSign
  }

  private async getUtxoBatch(body: BtcTransactionFromUTXO) {
    const fromUTXOs = body.fromUTXO.map((item) => ({ txHash: item.txHash, index: item.index }))
    const utxos: (BtcUTXO | null)[] = []
    for (const utxoItem of fromUTXOs) {
      const utxo = await this.getUtxoSilent(utxoItem.txHash, utxoItem.index)
      if (utxo === null || !utxo.address) {
        utxos.push(null)
      } else {
        utxos.push(utxo)
      }
    }
    return utxos
  }

  private async getUtxoSilent(hash: string, index: number): Promise<BtcUTXO | null> {
    try {
      return await this.connector.get<BtcUTXO>({
        path: `/v3/bitcoin/utxo/${hash}/${index}`,
      })
    } catch (e) {
      return null
    }
  }

  private async validateBalanceFromUTXO(body: UtxoTxPayload, utxos: BtcUTXO[]) {
    const totalBalance = utxos.reduce((sum, u) => sum.plus(new BigNumber(u.value ?? 0)), new BigNumber(0))

    const totalFee = body.fee ? new BigNumber(body.fee) : await this.getEstimateFeeFromUtxo(body, utxos)

    const totalValue = body.to.reduce((sum, t) => sum.plus(new BigNumber(t.value)), new BigNumber(0))

    if (totalBalance.isLessThan(totalValue.plus(totalFee))) {
      throw new Error(`Insufficient balance to send transaction. TotalBalance: ${totalBalance}, TotalValue: ${totalValue}, TotalFee: ${totalFee}`)
    }
  }

  private async getEstimateFeeFromUtxo(body: UtxoTxPayload, utxos: BtcUTXO[]): Promise<BigNumber> {
    const fromUTXO = utxos.map((utxo) => ({ txHash: utxo.hash, index: utxo.index }))

    const fee = await this.connector.post<FeeBtcBased>({
      path: `/v3/blockchain/estimate`,
      body: {
        chain: this.getChainForFee(),
        type: 'TRANSFER',
        fromUTXO,
        to: body.to,
      },
    })

    return new BigNumber(fee.slow ?? 0)
  }

  private getChainForFee() {
    let chain: string

    switch (this.sdkConfig.network) {
      case Network.BITCOIN:
      case Network.BITCOIN_TESTNET:
        chain = 'BTC'
        break
      case Network.LITECOIN:
      case Network.LITECOIN_TESTNET:
        chain = 'LTC'
        break
      case Network.DOGECOIN:
      case Network.DOGECOIN_TESTNET:
        chain = 'DOGE'
        break
      default:
        throw new Error('Unsupported network')
    }
    return chain
  }
}
