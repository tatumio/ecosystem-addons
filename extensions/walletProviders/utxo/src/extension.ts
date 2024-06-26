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
// no types for this guy sadly
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PrivateKey as DogePrivateKey, Script as DogeScript, Transaction as DogeTransaction, } from 'bitcore-lib-doge'
// same story
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PrivateKey as LtcPrivateKey, Script as LtcScript, Transaction as LtcTransaction, } from 'bitcore-lib-ltc'
import ECPairFactory from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import {
  BtcBasedTransaction,
  DogeUTXO,
  FeeBtcBased,
  TransactionFromAddress,
  TransactionFromAddressSource,
  TransactionFromUTXO,
  TransactionTarget,
  UTXO,
  UtxoResponse,
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
    this.utxoRpc = this.tatumSdkContainer.getRpc<UtxoRpc>()
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
    let rawTransaction: string

    switch (this.sdkConfig.network) {
      case Network.BITCOIN:
      case Network.BITCOIN_TESTNET:
        rawTransaction = await this.getRawTransaction(payload)
        break
      case Network.LITECOIN:
      case Network.LITECOIN_TESTNET:
        rawTransaction = await this.getRawTransactionLtc(payload)
        break
      case Network.DOGECOIN:
      case Network.DOGECOIN_TESTNET:
        rawTransaction = await this.getRawTransactionDoge(payload)
        break
      default:
        throw new Error('Unsupported network')
    }
    const response = await this.utxoRpc.sendRawTransaction(rawTransaction)

    if (!response?.result) {
      throw new Error(JSON.stringify(response.error))
    }

    return response.result
  }

  private async getRawTransaction(payload: UtxoTxPayload) {
    const tx: BtcBasedTransaction = new Transaction()
    let privateKeysToSign: string[] = []

    this.setChangeAddress(payload, tx)
    this.setFee(payload, tx)
    payload.to.forEach((to) => {
      this.setToAddress(tx, to)
    })

    if ('fromAddress' in payload) {
      privateKeysToSign = await this.privateKeysFromAddress(tx, payload)
    } else if ('fromUTXO' in payload) {
      privateKeysToSign = await this.privateKeysFromUTXO(tx, payload)
    }

    new Set(privateKeysToSign).forEach((key) => {
      tx.sign(new PrivateKey(key))
    })

    return tx.serialize(this.config?.skipAllChecks)
  }

  private setToAddress(tx: BtcBasedTransaction, to: TransactionTarget) {
    try {
      tx.to(to.address, toSatoshis(to.value))
    } catch (e) {
      throw new Error(`'${to.address}' is not a valid address`)
    }
  }

  private setChangeAddress(payload: UtxoTxPayload, tx: BtcBasedTransaction) {
    if (payload.changeAddress) {
      try {
        tx.change(payload.changeAddress)
      } catch (e) {
        throw new Error(`'${payload.changeAddress}' is not a valid change address`)
      }
    }
  }

  private setFee(payload: UtxoTxPayload, tx: BtcBasedTransaction) {
    if (payload.fee) {
      try {
        tx.fee(toSatoshis(payload.fee))
      } catch (e) {
        throw new Error(`'${payload.fee}' is not a valid fee value`)
      }
    }
  }

  private async getRawTransactionLtc(payload: UtxoTxPayload) {
    const { to, fee, changeAddress } = payload
    this.validateUtxoBody(payload)
    const transaction = new LtcTransaction()

    const hasFeeAndChange = !!(changeAddress && fee)
    let totalOutputs = hasFeeAndChange ? toSatoshis(fee) : 0

    for (const item of to) {
      const amount = toSatoshis(item.value)
      totalOutputs += amount
      this.setToAddress(transaction, item)
    }

    let totalInputs = 0
    const privateKeysToSign = []
    if ('fromUTXO' in payload) {
      const filteredUtxos = await this.getUtxoBatch(payload)
      let validUtxoFound = false
      for (let i = 0; i < filteredUtxos.length; i++) {
        const utxo = filteredUtxos[i]
        if (utxo === null || !utxo.address) continue

        validUtxoFound = true

        const utxoItem = payload.fromUTXO[i]

        transaction.from([
          LtcTransaction.UnspentOutput.fromObject({
            txId: utxoItem.txHash,
            outputIndex: utxoItem.index,
            script: Script.fromAddress(utxo.address).toString(),
            satoshis: utxo.value,
          }),
        ])

        privateKeysToSign.push(utxoItem.privateKey)
      }

      if (!validUtxoFound) {
        throw new Error('No valid UTXOs found. They are probably already spent.')
      }
    } else if ('fromAddress' in payload) {
      for (const item of payload.fromAddress) {
        if (totalInputs >= totalOutputs) {
          break
        }
        const utxos = await this.getUtxos(item, totalOutputs, totalInputs)
        for (const utxo of utxos) {
          const satoshis = toSatoshis(utxo.value)
          totalInputs += satoshis
          transaction.from([
            Transaction.UnspentOutput.fromObject({
              txId: utxo.txHash,
              outputIndex: utxo.index,
              script: LtcScript.fromAddress(utxo.address).toString(),
              satoshis,
            }),
          ])

          privateKeysToSign.push(item.privateKey)
        }
      }
    }

    if (hasFeeAndChange) {
      this.setChangeAddress(payload, transaction)
      this.setFee(payload, transaction)
    }

    const shouldHaveChangeOutput = totalInputs > totalOutputs && hasFeeAndChange
    this.checkDustAmountInChange(transaction, payload, shouldHaveChangeOutput)

    for (const pk of privateKeysToSign) {
      transaction.sign(LtcPrivateKey.fromWIF(pk))
    }

    return transaction.serialize()
  }

  private async getRawTransactionDoge(payload: UtxoTxPayload) {
    const { to, fee, changeAddress } = payload
    this.validateUtxoBody(payload)
    const transaction = new DogeTransaction()

    const hasFeeAndChange = !!(changeAddress && fee)
    let totalOutputs = hasFeeAndChange ? toSatoshis(fee) : 0

    for (const item of to) {
      const amount = toSatoshis(item.value)
      totalOutputs += amount
      this.setToAddress(transaction, item)
    }

    let totalInputs = 0
    const privateKeysToSign = []
    if ('fromUTXO' in payload) {
      const filteredUtxos = await this.getDogeUtxoBatch(payload)
      let validUtxoFound = false
      for (let i = 0; i < filteredUtxos.length; i++) {
        const utxo = filteredUtxos[i]
        const address = utxo?.scriptPubKey?.addresses?.[0]
        if (utxo === null || utxo.scriptPubKey === null || !address) continue

        validUtxoFound = true

        const utxoItem = payload.fromUTXO[i]

        transaction.from([
          DogeTransaction.UnspentOutput.fromObject({
            txId: utxoItem.txHash,
            outputIndex: utxoItem.index,
            script: Script.fromAddress(address).toString(),
            satoshis: utxo.value,
          }),
        ])

        privateKeysToSign.push(utxoItem.privateKey)
      }

      if (!validUtxoFound) {
        throw new Error('No valid UTXOs found. They are probably already spent.')
      }
    } else if ('fromAddress' in payload) {
      for (const item of payload.fromAddress) {
        if (totalInputs >= totalOutputs) {
          break
        }
        const utxos = await this.getUtxos(item, totalOutputs, totalInputs)
        for (const utxo of utxos) {
          const satoshis = toSatoshis(utxo.value)
          totalInputs += satoshis
          transaction.from([
            Transaction.UnspentOutput.fromObject({
              txId: utxo.txHash,
              outputIndex: utxo.index,
              script: DogeScript.fromAddress(utxo.address).toString(),
              satoshis,
            }),
          ])

          privateKeysToSign.push(item.privateKey)
        }
      }
    }

    if (hasFeeAndChange) {
      this.setChangeAddress(payload, transaction)
      this.setFee(payload, transaction)
    }

    const shouldHaveChangeOutput = totalInputs > totalOutputs && hasFeeAndChange
    this.checkDustAmountInChange(transaction, payload, shouldHaveChangeOutput)

    for (const pk of privateKeysToSign) {
      transaction.sign(DogePrivateKey.fromWIF(pk))
    }

    return transaction.serialize()
  }

  supportedNetworks: Network[] = [
    Network.BITCOIN,
    Network.DOGECOIN,
    Network.LITECOIN,
    Network.BITCOIN_TESTNET,
    Network.DOGECOIN_TESTNET,
    Network.LITECOIN_TESTNET,
  ]

  /**
   * In case if change amount is dust, its amount will be appended to fee.
   * We need to check it to prevent implicit amounts change
   */
  private checkDustAmountInChange(
    transaction: Transaction,
    body: UtxoTxPayload,
    shouldHaveChangeOutput: boolean,
  ) {
    const outputsCount = transaction.outputs.length
    const expectedOutputsCount = body.to.length + (shouldHaveChangeOutput ? 1 : 0)
    if (outputsCount !== expectedOutputsCount) {
      throw new Error('Transaction would result in dust amount being appended to the fee.')
    }
  }

  private validateUtxoBody(body: UtxoTxPayload) {
    if (!('fromUTXO' in body) && !('fromAddress' in body)) {
      throw new Error('Either fromUTXO or fromAddress must be provided')
    }

    if (
      ('fromUTXO' in body && body.fromUTXO.length === 0) ||
      ('fromAddress' in body && body.fromAddress.length === 0)
    ) {
      throw new Error('Either fromUTXO or fromAddress must be provided')
    }

    if ((body.fee && !body.changeAddress) || (!body.fee && body.changeAddress)) {
      throw new Error('Either fee and changeAddress must be provided or none of them')
    }
  }

  private async privateKeysFromAddress(
    transaction: BtcBasedTransaction,
    body: TransactionFromAddress,
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

  private async getUtxos(item: TransactionFromAddressSource, totalOutputs: number, totalInputs: number) {
    return this.connector.get<UtxoResponse>({
      path: `data/utxos?chain=${this.sdkConfig.network}&address=${item.address}&totalValue=${fromSatoshis(
        totalOutputs - totalInputs,
      )}`,
    })
  }

  private async privateKeysFromUTXO(
    transaction: Transaction,
    body: TransactionFromUTXO,
  ): Promise<Array<string>> {
    if (body.fromUTXO.length === 0 && !this.config?.skipAllChecks) {
      throw new Error('No fromUTXO provided')
    }

    const privateKeysToSign: string[] = []
    const utxos: UTXO[] = []

    const filteredUtxos = await this.getUtxoBatch(body)

    let validUtxoFound = false

    for (let i = 0; i < filteredUtxos.length; i++) {
      const utxo = filteredUtxos[i]
      if (utxo === null || !utxo.address) continue

      validUtxoFound = true

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

    if (!validUtxoFound) {
      throw new Error('No valid UTXOs found. They are probably already spent.')
    }

    if (!this.config?.skipAllChecks) {
      await this.validateBalanceFromUTXO(body, utxos)
    }

    return privateKeysToSign
  }

  private async getDogeUtxoBatch(body: TransactionFromUTXO): Promise<(DogeUTXO | null)[]> {
    const fromUTXOs = body.fromUTXO.map((item) => ({ txHash: item.txHash, index: item.index }))
    const utxos: (DogeUTXO | null)[] = []
    for (const utxoItem of fromUTXOs) {
      const utxo = await this.getUtxoSilent<DogeUTXO>(utxoItem.txHash, utxoItem.index)
      if (utxo === null || !utxo.scriptPubKey?.addresses?.[0]) {
        utxos.push(null)
      } else {
        utxos.push(utxo)
      }
    }
    return utxos
  }

  private async getUtxoBatch(body: TransactionFromUTXO): Promise<(UTXO | null)[]> {
    const fromUTXOs = body.fromUTXO.map((item) => ({ txHash: item.txHash, index: item.index }))
    const utxos: (UTXO | null)[] = []
    for (const utxoItem of fromUTXOs) {
      const utxo = await this.getUtxoSilent<UTXO>(utxoItem.txHash, utxoItem.index)
      if (utxo === null || !utxo.address) {
        utxos.push(null)
      } else {
        utxos.push(utxo)
      }
    }
    return utxos
  }

  private async getUtxoSilent<T>(hash: string, index: number): Promise<T | null> {
    try {
      return await this.connector.get<T>({
        path: `${this.getChainForUtxo()}/utxo/${hash}/${index}`,
      })
    } catch (e) {
      return null
    }
  }

  private async validateBalanceFromUTXO(body: UtxoTxPayload, utxos: UTXO[]) {
    const totalBalance = utxos.reduce((sum, u) => sum.plus(new BigNumber(u.value ?? 0)), new BigNumber(0))

    const totalFee = body.fee ? new BigNumber(body.fee) : await this.getEstimateFeeFromUtxo(body, utxos)

    const totalValue = body.to.reduce((sum, t) => sum.plus(new BigNumber(t.value)), new BigNumber(0))

    if (totalBalance.isLessThan(totalValue.plus(totalFee))) {
      throw new Error(
        `Insufficient balance to send transaction. TotalBalance: ${totalBalance}, TotalValue: ${totalValue}, TotalFee: ${totalFee}`,
      )
    }
  }

  private async getEstimateFeeFromUtxo(body: UtxoTxPayload, utxos: UTXO[]): Promise<BigNumber> {
    const fromUTXO = utxos.map((utxo) => ({ txHash: utxo.hash, index: utxo.index }))

    const fee = await this.connector.post<FeeBtcBased>({
      path: `blockchain/estimate`,
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
    switch (this.sdkConfig.network) {
      case Network.BITCOIN:
      case Network.BITCOIN_TESTNET:
        return 'BTC'
      case Network.LITECOIN:
      case Network.LITECOIN_TESTNET:
        return 'LTC'
      case Network.DOGECOIN:
      case Network.DOGECOIN_TESTNET:
        return 'DOGE'
      default:
        throw new Error('Unsupported network')
    }
  }

  private getChainForUtxo() {
    switch (this.sdkConfig.network) {
      case Network.BITCOIN:
      case Network.BITCOIN_TESTNET:
        return 'bitcoin'
      case Network.LITECOIN:
      case Network.LITECOIN_TESTNET:
        return 'litecoin'
      case Network.DOGECOIN:
      case Network.DOGECOIN_TESTNET:
        return 'dogecoin'
      default:
        throw new Error('Unsupported network')
    }
  }
}
