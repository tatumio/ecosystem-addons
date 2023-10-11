import { Ethereum, Network, TatumSDK } from '@tatumio/tatum'
import { EvmWalletProvider } from './extension'

describe('EvmWalletProvider', () => {
  let tatumSdk: Ethereum

  beforeEach(async () => {
    tatumSdk = await TatumSDK.init<Ethereum>({
      network: Network.ETHEREUM_SEPOLIA,
      configureWalletProviders: [EvmWalletProvider],
      verbose: true,
    })
  })

  const path = "m/44'/1'/0'/0"
  const mnemonic =
    'swear you chase card label found biology engine bag remind grace special control twelve frozen bring dynamic syrup peanut ice share orchard lion viable'
  const xpub =
    'xpub6DkSdTvpio6iohxQSbNPjwud2MCmcjY6XskRCJfoA4yzch3xUmurdJg2Y15DJf3beCt43Vto7g1SK5HRFzpUGK6oNZ3Z18ovj71Lq6WxGEA'
  const privateKey = '0x611ef5dc8aa6376f6d8ff0eaed572d6fd61b636a552151feb0524757aac00d71'
  const address = '0x7ac4f038ac65030453a5119fecb5c4d0889f8049'

  describe('generateMnemonic', () => {
    it('should generate 24 word mnemonic', () => {
      const result = tatumSdk.walletProvider.use(EvmWalletProvider).generateMnemonic()
      expect(result.split(' ')).toHaveLength(24)
    })
  })
  describe('generateXpub', () => {
    it('should generate xpub', async () => {
      const result = await tatumSdk.walletProvider.use(EvmWalletProvider).generateXpub()
      expect(result.xpub).toBeTruthy()
      expect(result.mnemonic).toBeTruthy()
      expect(result.derivationPath).toBe(path)
    })
  })

  describe('generateXpub', () => {
    it('should generate xpub from mnemonic', async () => {
      const result = await tatumSdk.walletProvider.use(EvmWalletProvider).generateXpub(mnemonic)
      expect(result.xpub).toBe(xpub)
      expect(result.mnemonic).toBe(mnemonic)
      expect(result.derivationPath).toBe(path)
    })
  })

  describe('generatePrivateKeyFromMnemonic', () => {
    it('should generate private key', async () => {
      const result = await tatumSdk.walletProvider
        .use(EvmWalletProvider)
        .generatePrivateKeyFromMnemonic(mnemonic, 0)
      expect(result).toBe(privateKey)
    })
  })

  describe('generateAddressFromMnemonic', () => {
    it('should generate address', async () => {
      const result = await tatumSdk.walletProvider
        .use(EvmWalletProvider)
        .generateAddressFromMnemonic(mnemonic, 0)
      expect(result).toBe(address)
    })
  })

  describe('generateAddressFromXpub', () => {
    it('should generate address from xpub', () => {
      const result = tatumSdk.walletProvider.use(EvmWalletProvider).generateAddressFromXpub(xpub, 0)
      expect(result).toBe(address)
    })
  })

  describe('generateAddressFromPrivateKey', () => {
    it('should generate address from private key', () => {
      const result = tatumSdk.walletProvider.use(EvmWalletProvider).generateAddressFromPrivateKey(privateKey)
      expect(result).toBe(address)
    })
  })

  describe('getWallet', () => {
    it('should generate wallet', async () => {
      const wallet = await tatumSdk.walletProvider.use(EvmWalletProvider).getWallet()
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
      const txHash = await tatumSdk.walletProvider.use(EvmWalletProvider).signAndBroadcast(txRequest)
      expect(txHash).toBeTruthy()
      expect(txHash).toHaveLength(66)
    })
  })
})
