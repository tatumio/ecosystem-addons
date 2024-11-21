import { Bitcoin, Network, TatumSDK } from '@tatumio/tatum'
import { UtxoWalletProvider } from './extension'
import { UtxoTxPayload } from './types'

describe('UtxoWalletProvider', () => {
  let tatumSdk: Bitcoin

  beforeEach(async () => {
    tatumSdk = await TatumSDK.init<Bitcoin>({
      network: Network.BITCOIN_TESTNET,
      configureWalletProviders: [UtxoWalletProvider],
      verbose: true,
    })
  })

  const path = "m/44'/0'/0'/0"
  const mnemonic =
    'audit hamster slot gesture brave fork ability agree over tiger bread soap bullet squeeze slide case roof drip seven plunge yard cat ozone custom'
  const xpub =
    'tpubDE23Kfj1twxmcCYAzuhAtw7se4xVdu9z6R1Psykd5HLyLtNbx4MFSsqi47FRg6PsQQJUrFUNUUViZiPUnmTthvd27idX2rorToRvGar5e9A'
  const privateKey = 'cVeQk2DzVp8q5AVz4VS1vTqAGn7BmdB7SjrvtB3HPMFP8rpQeeZn'
  const address = 'muNjVhqHUfNzHBrwawaGmjBt9suoMr1YxV'

  describe('generateMnemonic', () => {
    it('should generate 24 word mnemonic', () => {
      const result = tatumSdk.walletProvider.use(UtxoWalletProvider).generateMnemonic()
      expect(result.split(' ')).toHaveLength(24)
    })
  })

  describe('generateXpub', () => {
    it('should generate xpub', async () => {
      const result = await tatumSdk.walletProvider.use(UtxoWalletProvider).generateXpub()
      expect(result.xpub).toBeTruthy()
      expect(result.mnemonic).toBeTruthy()
      expect(result.derivationPath).toBe(path)
    })
  })

  describe('generateXpub', () => {
    it('should generate xpub from mnemonic', async () => {
      const result = await tatumSdk.walletProvider.use(UtxoWalletProvider).generateXpub(mnemonic)
      expect(result.xpub).toBe(xpub)
      expect(result.mnemonic).toBe(mnemonic)
      expect(result.derivationPath).toBe(path)
    })
  })

  describe('generatePrivateKeyFromMnemonic', () => {
    it('should generate private key', async () => {
      const result = await tatumSdk.walletProvider
        .use(UtxoWalletProvider)
        .generatePrivateKeyFromMnemonic(mnemonic, 0)
      expect(result).toBe(privateKey)
    })
  })

  describe('generateAddressFromMnemonic', () => {
    it('should generate address', async () => {
      const result = await tatumSdk.walletProvider
        .use(UtxoWalletProvider)
        .generateAddressFromMnemonic(mnemonic, 0)
      expect(result).toBe(address)
    })
  })

  describe('generateAddressFromXpub', () => {
    it('should generate address from xpub', () => {
      const result = tatumSdk.walletProvider.use(UtxoWalletProvider).generateAddressFromXpub(xpub, 0)
      expect(result).toBe(address)
    })
  })

  describe('generateAddressFromPrivateKey', () => {
    it('should generate address from private key', () => {
      const result = tatumSdk.walletProvider.use(UtxoWalletProvider).generateAddressFromPrivateKey(privateKey)
      expect(result).toBe(address)
    })
  })

  describe('getWallet', () => {
    it('should generate wallet', async () => {
      const wallet = await tatumSdk.walletProvider.use(UtxoWalletProvider).getWallet()
      expect(wallet.address).toBeTruthy()
      expect(wallet.privateKey).toBeTruthy()
      expect(wallet.mnemonic).toBeTruthy()
      expect(wallet.mnemonic.split(' ')).toHaveLength(24)
    })
  })

  describe('signAndBroadcast', () => {
    it('should sign and broadcast transaction from address', async () => {
      const txRequest: UtxoTxPayload = {
        fromAddress: [
          {
            address: 'tb1qjzjyd3l3vh8an8w4mkr6dwur59lan60367kr04',
            privateKey: privateKey,
          },
        ],
        to: [{ address: 'tb1q5gtkjxguam0mlvevwxf2q9ldnq8ladenlhn3mw', value: 0.0001 }],
        fee: '0.00001',
        changeAddress: 'tb1qjzjyd3l3vh8an8w4mkr6dwur59lan60367kr04',
      }
      const txHash = await tatumSdk.walletProvider.use(UtxoWalletProvider).signAndBroadcast(txRequest)
      expect(txHash).toBeTruthy()
      expect(txHash).toHaveLength(64)
    })
  })

  describe('signAndBroadcast', () => {
    it('should sign and broadcast transaction from UTXO', async () => {
      const txRequest: UtxoTxPayload = {
        fromUTXO: [
          {
            txHash: '9bfddffd79a7af830a4070173b1f93547ee4eae9cdb542b153e2daaea1885f3d',
            index: 1,
            privateKey: privateKey,
          },
        ],
        to: [{ address: 'tb1q5gtkjxguam0mlvevwxf2q9ldnq8ladenlhn3mw', value: 0.004 }],
      }
      const txHash = await tatumSdk.walletProvider.use(UtxoWalletProvider).signAndBroadcast(txRequest)
      expect(txHash).toBeTruthy()
      expect(txHash).toHaveLength(64)
    })
  })
})
