import { ITatumSdkContainer, Network, TatumSdkWalletProvider } from '@tatumio/tatum'
import { BIP32Factory, BIP32Interface } from 'bip32'
import { generateMnemonic, mnemonicToSeed } from 'bip39'
import * as ecc from 'tiny-secp256k1'
import { TRON_DERIVATION_PATH } from './consts'
import {
  TronTransactionHeaderInfo,
  TronTransactionValue,
  TronTxPayload,
  TronWallet,
  XpubWithMnemonic,
} from './types'
import { generateAddress, isBase58, isHex } from './utils'
import { TronTxRawBody } from '@tatumio/tatum/dist/src/dto/rpc/TronRpcSuite'
import { TronRpc } from '@tatumio/tatum/dist/src/service/rpc/evm/TronRpc'
// tronweb lib don't have any typings (not even in @types)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TronWeb from 'tronweb'

export class TronWalletProvider extends TatumSdkWalletProvider<TronWallet, TronTxPayload> {
  private readonly tronRpc: TronRpc

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.tronRpc = this.tatumSdkContainer.get(TronRpc)
  }

  /**
   * Generates a mnemonic seed phrase.
   * @returns {string} A mnemonic seed phrase.
   */
  generateMnemonic(): string {
    return generateMnemonic(256)
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
    path = path || TRON_DERIVATION_PATH

    const seed = await mnemonicToSeed(mnemonic)

    const xpub = BIP32Factory(ecc)
        .fromSeed(seed)
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
  public async generatePrivateKeyFromMnemonic(mnemonic: string, index: number, path?: string) {
    path = path || TRON_DERIVATION_PATH

    const seed = await mnemonicToSeed(mnemonic)

    return BIP32Factory(ecc)
        .fromSeed(seed)
        .derivePath(path)
        .derive(index)
        .privateKey
        ?.toString('hex')
        ?? ''
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
    path = path || TRON_DERIVATION_PATH

    const seed = await mnemonicToSeed(mnemonic)

    const xpub = BIP32Factory(ecc)
        .fromSeed(seed)
        .derivePath(path)
        .neutered()
        .toBase58()

    const pub = BIP32Factory(ecc)
        .fromBase58(xpub)
        .derive(index)
        .publicKey

    return TronWeb.address.fromHex(generateAddress(pub))
  }

  /**
   * Generates an address from an extended public key (xpub) and an index.
   * @param {string} xpub - The extended public key.
   * @param {number} index - The index to derive the address from.
   * @returns {string} An Ethereum address in string format.
   */
  public generateAddressFromXpub(xpub: string, index: number) {
    let bip32: BIP32Interface
    if (xpub.length === 130 && isHex(xpub)) {
      bip32 = BIP32Factory(ecc).fromPublicKey(
        Buffer.from(xpub.slice(0, 66), 'hex'),
        Buffer.from(xpub.slice(-64), 'hex'),
      )
    } else if (xpub.length === 111 && isBase58(xpub)) {
      bip32 = BIP32Factory(ecc).fromBase58(xpub)
    } else {
      throw new Error('Unknown xpub format')
    }
    return TronWeb.address.fromHex(generateAddress(bip32.derive(index).publicKey))
  }

  /**
   * Generates an address from a given private key.
   * @param {string} privateKey - The private key in string format.
   * @returns {string} An Ethereum address in string format.
   */
  public generateAddressFromPrivateKey(privateKey: string) {
    return TronWeb.address.fromPrivateKey(privateKey)
  }

  /**
   * Generates an EVM-compatible wallet, which includes an address, private key, and a mnemonic.
   * @returns {TronWallet} An object containing address, private key, and mnemonic.
   */
  public async getWallet() {
    const mnemonic = this.generateMnemonic()
    const privateKey = await this.generatePrivateKeyFromMnemonic(mnemonic, 0)
    const address = this.generateAddressFromPrivateKey(privateKey)

    return { address, privateKey, mnemonic } as TronWallet
  }

  /**
   * Signs and broadcasts a Tron transaction payload.
   * @param {TronTxPayload} payload - The Tron transaction payload, which includes private key and transaction details.
   * @returns {Promise<string>} A promise that resolves to the transaction hash.
   */
  public async signAndBroadcast(payload: TronTxPayload): Promise<string> {
    const value = this.getTransactionValue(payload)
    const metaData = await this.getHeaderInfo()
    const tx = this.getTx(value, metaData)

    const signedTransaction = TronWeb.utils.crypto.signTransaction(payload.fromPrivateKey, tx)

    const response = await this.tronRpc.broadcastTransaction(signedTransaction)

    if (!response?.txid) {
      throw new Error(JSON.stringify(response))
    }

    return response.txid
  }

  private getTx(value: TronTransactionValue, metaData: TronTransactionHeaderInfo): TronTxRawBody {
    const tx = {
      visible: false,
      txID: '',
      raw_data_hex: '',
      raw_data: {
        contract: [
          {
            parameter: {
              value,
              type_url: `type.googleapis.com/protocol.TransferContract`,
            },
            type: 'TransferContract',
          },
        ],
        ...metaData,
      },
    }

    const pb = TronWeb.utils.transaction.txJsonToPb(tx)
    tx.txID = TronWeb.utils.transaction.txPbToTxID(pb).replace(/^0x/, '')
    tx.raw_data_hex = TronWeb.utils.transaction.txPbToRawDataHex(pb).toLowerCase()

    return tx
  }

  private getTransactionValue(payload: TronTxPayload): TronTransactionValue {
    return {
      to_address: TronWeb.address.toHex(payload.to),
      owner_address: TronWeb.address.toHex(TronWeb.address.fromPrivateKey(payload.fromPrivateKey)),
      amount: parseInt(TronWeb.toSun(payload.amount)),
    }
  }

  private async getHeaderInfo(): Promise<TronTransactionHeaderInfo> {
    const block = await this.tronRpc.getNowBlock()
    return {
      ref_block_bytes: block.block_header.raw_data.number.toString(16).slice(-4).padStart(4, '0'),
      ref_block_hash: block.blockID.slice(16, 32),
      expiration: block.block_header.raw_data.timestamp + 60 * 1000,
      timestamp: block.block_header.raw_data.timestamp,
    }
  }

  supportedNetworks: Network[] = [Network.TRON, Network.TRON_SHASTA]
}
