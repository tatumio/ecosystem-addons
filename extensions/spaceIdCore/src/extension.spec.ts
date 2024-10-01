import { Ethereum, Network, TatumSDK } from '@tatumio/tatum'

import { SpaceIdCore } from './extension'

const ETH_ADDR = '0x5228BC5B84754f246Fc7265787511ae9C0afEBC5'
const ETH_NAME = 'bitgetwallet.eth'
const NEW_NAME = 'tatumrandomtest'

describe('SPACE ID Core', () => {
  let tatumSdk: Ethereum

  beforeAll(async () => {
    tatumSdk = await TatumSDK.init({
      network: Network.ETHEREUM,
      configureExtensions: [SpaceIdCore],
      quiet: true,
    })
  })

  afterAll(async () => {
    await tatumSdk.destroy()
  })

  describe('Web3 Name SDK', () => {
    it('should resolve address from domain name', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getAddress(ETH_NAME)
      expect(result).toBe(ETH_ADDR)
    })

    it('should resolve domain name from address', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getDomainName(ETH_ADDR, { queryChainIdList: [1] })
      expect(result).toBe(ETH_NAME)
    })

    it('should fetch text record by domain name and key', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getDomainRecord(ETH_NAME, 'avatar')
      expect(result).toContain(ETH_NAME)
    })

    it('should fetch metadata by domain name', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getMetadata(ETH_NAME)
      expect(result?.name).toBe(ETH_NAME)
    })
  })

  // in order to run these tests, private key needs to be provided
  describe.skip('Registration Integration', () => {
    const privateKey = ''

    it('should check availability of the domain name', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).isDomainAvailable(NEW_NAME, privateKey)
      expect(result).toBe(true)
    })

    it('should query registration fee of the domain', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getRegistrationFee(NEW_NAME, 1, privateKey)
      expect(result?.gt(0)).toBe(true)
    })

    it('should fail to register new domain due to unavailability', async () => {
      const name = ETH_NAME.replace('.eth', 'copy')
      const result = await tatumSdk.extension(SpaceIdCore).registerDomain(name, 1, privateKey)
      expect(result).toBe(false)
    })
  })
})
