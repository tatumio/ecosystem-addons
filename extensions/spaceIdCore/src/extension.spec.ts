import { Network, TatumSDK } from '@tatumio/tatum'
import { SpaceIdCore } from './extension'

describe('SPACE ID Core', async () => {
  const tatumSdk = await TatumSDK.init({
    network: Network.KADENA_TESTNET,
    configureExtensions: [SpaceIdCore],
    verbose: true,
  })

  describe('Random Test', () => {
    it('successful test', async () => {
      // TODO: Add tests
    })
  })
})
