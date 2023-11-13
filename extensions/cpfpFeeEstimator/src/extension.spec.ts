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
        .estimateCPFPFee('a8c22656c585a5d1fb5bdfdabecf158be55492d03a22190d95e8eb561431dc6c')

      expect(cpfpFee).toBeDefined()
    }, 180000)
  })
})
