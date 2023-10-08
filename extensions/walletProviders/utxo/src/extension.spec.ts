import { Bitcoin, Network, TatumSDK } from '@tatumio/tatum'
import { UtxoWalletProvider } from './extension'

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
    it('should sign and broadcast transaction', async () => {
      const txRequest = {
        privateKey: privateKey,
        to: '0xc34909c73c7ba79087a5aba844890faa13b0270b',
        value: '0.00001',
      }
      const txHash = await tatumSdk.walletProvider.use(UtxoWalletProvider).signAndBroadcast(txRequest)
      expect(txHash).toBeTruthy()
      expect(txHash).toHaveLength(66)
    })
  })
})
