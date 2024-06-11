import { Kadena, Network, TatumSDK } from '@tatumio/tatum'
import { KadenaWalletProvider } from './extension'

describe('KadenaWalletProvider', () => {
  let tatumSdk: Kadena

  beforeEach(async () => {
    tatumSdk = await TatumSDK.init<Kadena>({
      network: Network.KADENA_TESTNET,
      configureWalletProviders: [KadenaWalletProvider],
      verbose: true,
    })
  })
  describe('getWallet', () => {
    it('should get a wallet', async () => {
      const wallet = await tatumSdk.walletProvider.use(KadenaWalletProvider).getWallet()
      expect(wallet.address).toBeTruthy()
      expect(wallet.secretKey).toBeTruthy()
      expect(wallet.publicKey).toBeTruthy()
    })
  })
})
