import { ApiVersion, Bitcoin, Network, TatumSDK } from '@tatumio/tatum'
import { CpfpFeeEstimator } from './extension'

describe('CPFP Fee Estimator', () => {
  let tatumSdk: Bitcoin

  beforeAll(async () => {
    tatumSdk = await TatumSDK.init<Bitcoin>({
      network: Network.BITCOIN,
      configureExtensions: [CpfpFeeEstimator],
      version: ApiVersion.V3,
      //verbose: true,
    })
  })

  afterAll(async () => {
    await tatumSdk.destroy()
  })

  describe('estimateCPFPFee', () => {
    it('should return additional fee', async () => {
      const cpfpFee = await tatumSdk
        .extension(CpfpFeeEstimator)
        .estimateCPFPFee('7fc15ec624a3b8d1e2ecc3cfef4395ffa1ac6246b0b763dda896d2c918d98017')

      expect(cpfpFee).toBeGreaterThanOrEqual(0)
    }, 180000)
  })
})
