import { Network, TatumSDK } from '@tatumio/tatum'
import { KadenaUtils } from './extension'

describe('Kadena Utils', async () => {
  const tatumSdk = await TatumSDK.init({
    network: Network.KADENA_TESTNET,
    configureExtensions: [KadenaUtils],
    verbose: true,
  })

  describe('Mint Basic NFT', () => {
    it('successfully mint', async () => {
      const uri = 'ipfs://example-uri' // or a PactReference
      const result = await tatumSdk
        .extension(KadenaUtils)
        .mintBasicNFT(uri, 'b76d05d9519343d3d8aab322bbe99222e9b925c94f80f1118165f7f00389a3e9', '1')
      expect(result).toBeDefined()
    })
  })
})
