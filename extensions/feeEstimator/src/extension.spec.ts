import { Ethereum, Network, TatumSDK } from '@tatumio/tatum'
import { FeeEstimator } from './extension'

describe('Fee Estimator - %s', () => {
  let tatumSdk: Ethereum

  beforeAll(async () => {
    tatumSdk = await TatumSDK.init<Ethereum>({
      network: Network.ETHEREUM,
      configureExtensions: [FeeEstimator],
      verbose: true,
    })
  })

  afterAll(async () => {
    await tatumSdk.destroy()
  })

  describe('getNewMempoolTransactions', () => {
    it('should get new mempool transactions', async () => {
      await tatumSdk.extension(FeeEstimator).startTracking()

      const result = await tatumSdk.extension(FeeEstimator).getAdjustedGasEstimate({to: '0x0000000000000000000000000000000000000000', from: '0x0000000000000000000000000000000000000000', value: '0x0'})
      expect(result).toBeGreaterThan(0)
    }, 60_000)
  })
})
