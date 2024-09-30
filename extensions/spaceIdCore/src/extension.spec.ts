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

  describe('Get address from domain name', () => {
    it('should resolve address from domain name', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getAddressFrom('spaceid.bnb')
      expect(result).toBe('0xb5932a6b7d50a966aec6c74c97385412fb497540')
    })
  })

  describe('Get domain name from address', () => {
    it('should resolve domain name from address', async () => {
      const result = await tatumSdk
        .extension(SpaceIdCore)
        .getNameFrom('0x2886D6792503e04b19640C1f1430d23219AF177F')
      expect(result).toBe('lydia.gno')
    })
  })
})
