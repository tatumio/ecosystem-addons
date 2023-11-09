import { Network, TatumSDK, Tezos } from '@tatumio/tatum'
import { TezosWalletProvider } from './extension'

describe('TezosWalletProvider', () => {
  let tatumSdk: Tezos

  beforeEach(async () => {
    tatumSdk = await TatumSDK.init<Tezos>({
      network: Network.TEZOS_TESTNET,
      configureWalletProviders: [TezosWalletProvider],
      verbose: true,
    })
  })

  const mnemonic = 'today vessel tray napkin drama town apology corn anchor amazing south garbage'
  const privateKey =
    'edskRvJQqeNih91dkoRkTG1PWxV5AruYbtrkp5DKibL2iMkPGWBbdYp8jpsY3N3skCNrwf9socTv9Sstonkckc4jTb4vMQCSpn'
  const address = 'tz1cCRCbBwnazV6howgD84a6fuhikKTnsWHZ'

  describe('generateMnemonic', () => {
    it('should generate 24 word mnemonic', () => {
      const result = tatumSdk.walletProvider.use(TezosWalletProvider).generateMnemonic()
      expect(result.split(' ')).toHaveLength(24)
    })
  })

  describe('generatePrivateKeyFromMnemonic', () => {
    it('should generate private key', async () => {
      const result = await tatumSdk.walletProvider
        .use(TezosWalletProvider)
        .generatePrivateKeyFromMnemonic(mnemonic)
      expect(result).toBe(privateKey)
    })
  })

  describe('getWallet', () => {
    it('should get a wallet', async () => {
      const wallet = await tatumSdk.walletProvider.use(TezosWalletProvider).getWallet()
      expect(wallet.address).toBeTruthy()
      expect(wallet.privateKey).toBeTruthy()
      expect(wallet.mnemonic).toBeTruthy()
      expect(wallet.mnemonic.split(' ')).toHaveLength(24)
    })
  })

  describe('generateAddressFromPrivateKey', () => {
    it('should generate an address from private key', async () => {
      const result = await tatumSdk.walletProvider
        .use(TezosWalletProvider)
        .generateAddressFromPrivateKey(privateKey)
      expect(result).toBe(address)
    })
  })

  describe('signAndBroadcast', () => {
    it('should sign and broadcast transaction', async () => {
      const tezosTxPayload = {
        privateKey: privateKey,
        to: address,
        amount: 0.1,
      }

      const txHash = await tatumSdk.walletProvider.use(TezosWalletProvider).signAndBroadcast(tezosTxPayload)
      expect(txHash).toBeTruthy()
      expect(txHash).toHaveLength(51)
    })
  })
})
