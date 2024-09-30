import { Ethereum, Network, TatumSDK } from '@tatumio/tatum'
import { SpaceIdCore } from './extension'

describe('SPACE ID Core', () => {
  let tatumSdk: Ethereum

  beforeAll(async () => {
    tatumSdk = await TatumSDK.init({
      network: Network.ETHEREUM,
      configureExtensions: [SpaceIdCore],
      verbose: true,
    })
  })

  afterAll(async () => {
    await tatumSdk.destroy()
  })

  describe('Random Test', () => {
    it('successful test', async () => {
      const result = tatumSdk.extension(SpaceIdCore).test()
      expect(result).toBeDefined()
    })
  })
})
