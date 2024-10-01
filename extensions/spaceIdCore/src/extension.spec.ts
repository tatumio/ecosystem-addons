import { Ethereum, Network, TatumSDK } from '@tatumio/tatum'
import { SpaceIdCore } from './extension'

const ETH_NAME = 'bitgetwallet.eth'
const ETH_ADDR = '0x5228BC5B84754f246Fc7265787511ae9C0afEBC5'

describe('SPACE ID Core', () => {
  let tatumSdk: Ethereum

  beforeAll(async () => {
    tatumSdk = await TatumSDK.init({
      network: Network.ETHEREUM,
      configureExtensions: [SpaceIdCore],
      quiet: true,
      // TODO: for testing purposes, should be removed later
      rpc: { nodes: [{ url: 'https://eth.public-rpc.com', type: 0 }] },
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
})
