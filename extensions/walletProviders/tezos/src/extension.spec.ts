import { Network, TatumSDK, Tezos } from '@tatumio/tatum'
import { TezosWalletProvider } from './extension'

describe('TezosWalletProvider', () => {
  let tatumSdk: Tezos

  beforeEach(async () => {
    tatumSdk = await TatumSDK.init<Tezos>({
      network: Network.TEZOS,
      configureWalletProviders: [
        { type: TezosWalletProvider, config: { rpcUrl: 'https://ghostnet.ecadinfra.com' } },
      ],
    })
  })

  const mnemonic = 'today vessel tray napkin drama town apology corn anchor amazing south garbage'
  const privateKey =
    'edskRvJQqeNih91dkoRkTG1PWxV5AruYbtrkp5DKibL2iMkPGWBbdYp8jpsY3N3skCNrwf9socTv9Sstonkckc4jTb4vMQCSpn'
  const address = 'tz1cCRCbBwnazV6howgD84a6fuhikKTnsWHZ'
  const recipient = 'tz1f1nboqWEhZJHwZnxnokQ9QoTiT21qMZxG'

  describe('generateMnemonic', () => {
    it('should generate 24 word mnemonic', () => {
      const result = tatumSdk.walletProvider.use(TezosWalletProvider).generateMnemonic()
      expect(result.split(' ')).toHaveLength(24)
    })
  })

  describe('generatePrivateKeyFromMnemonic', () => {
    it('should generate private key, public key and public key hash', async () => {
      const result = await tatumSdk.walletProvider
        .use(TezosWalletProvider)
        .generatePrivateAndPublicKeyFromMnemonic(mnemonic)
      expect(result.privateKey).toBe(privateKey)
      expect(result.address).toBe(address)
    })
  })

  describe('getWallet', () => {
    it('should generate wallet', async () => {
      const wallet = await tatumSdk.walletProvider.use(TezosWalletProvider).getWallet()
      expect(wallet.address).toBeTruthy()
      expect(wallet.privateKey).toBeTruthy()
      expect(wallet.mnemonic).toBeTruthy()
      expect(wallet.mnemonic.split(' ')).toHaveLength(24)
    })
  })

  describe('getPublicKeyFromPrivateKey', () => {
    it('should get public address', async () => {
      const result = await tatumSdk.walletProvider
        .use(TezosWalletProvider)
        .getPublicKeyFromPrivateKey(privateKey)
      expect(result).toBe(address)
    })
  })

  describe('signAndBroadcast', () => {
    it('should sign and broadcast transaction', async () => {
      const payload = {
        privateKey,
        to: recipient,
        amount: 0.01,
      }
      const txHash = await tatumSdk.walletProvider.use(TezosWalletProvider).signAndBroadcast(payload)
      expect(txHash).toBeTruthy()
      expect(txHash).toHaveLength(51)
    })
  })
})
