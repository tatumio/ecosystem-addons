import { Network, TatumSDK } from '@tatumio/tatum'
import { FullUtxo } from '@tatumio/tatum/dist/src/service/tatum/tatum.utxo'
import { MempoolTracker } from './extension'

const supportedNetworks: Network[] = [
  Network.BITCOIN,
  Network.BITCOIN_TESTNET,
  Network.LITECOIN,
  Network.LITECOIN_TESTNET,
  Network.DOGECOIN,
  Network.DOGECOIN_TESTNET,
]

describe.each(supportedNetworks)('Mempool Tracker - %s', (network) => {
  let tatumSdk: FullUtxo

  beforeAll(async () => {
    tatumSdk = await TatumSDK.init({
      network: network,
      configureExtensions: [MempoolTracker],
      verbose: true,
    })
  })

  afterAll(async () => {
    await tatumSdk.destroy()
  })

  describe('getNewMempoolTransactions', () => {
    it('should get new mempool transactions', async () => {
      await tatumSdk.extension(MempoolTracker).startTracking()

      const result = await tatumSdk.extension(MempoolTracker).getNewMempoolTransactions()
      expect(result.length).toBe(0)

      let result2 = []
      while (result2.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 5_000))
        result2 = await tatumSdk.extension(MempoolTracker).getNewMempoolTransactions()
      }

      expect(result2.length).toBeGreaterThan(0)
    }, 300_000)
  })
})
