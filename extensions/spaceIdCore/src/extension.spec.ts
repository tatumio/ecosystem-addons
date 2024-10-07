import { Network, TatumSDK, TatumSdkChain } from '@tatumio/tatum'

import { SpaceIdCore } from './extension'

describe('SPACE ID Core', () => {
  let tatumSdk: TatumSdkChain
  const privateKey = process.env.PRIVATE_KEY_FOR_TESTS || ''
  const config = {
    apiKey: process.env.TATUM_KEY_FOR_TESTS,
    configureExtensions: [SpaceIdCore],
    quiet: true,
  }

  describe('Web3 Name SDK (Ethereum)', () => {
    const ETH_ADDR = '0x5228BC5B84754f246Fc7265787511ae9C0afEBC5'
    const ETH_NAME = 'bitgetwallet.eth'

    beforeAll(async () => {
      tatumSdk = await TatumSDK.init({
        ...config,
        network: Network.ETHEREUM,
      })
    })

    afterAll(async () => {
      await tatumSdk.destroy()
    })

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

  describe('Web3 Name SDK (Solana)', () => {
    beforeAll(async () => {
      tatumSdk = await TatumSDK.init({
        ...config,
        network: Network.SOLANA,
      })
    })

    afterAll(async () => {
      await tatumSdk.destroy()
    })

    it('should resolve address from domain name', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getAddress('coinshares')
      expect(result?.toString()).toBe('6gjFy9Gp3mMN8uTLtfAyMmxdDfUe74YTo8cUTDXJtBUH')
    })

    it('should resolve domain name from address', async () => {
      const result = await tatumSdk
        .extension(SpaceIdCore)
        .getDomainName('Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb')
      expect(result).toBe('bonfida')
    })
  })

  describe('Registration Integration (Binance)', () => {
    const BSC_NAME = 'spaceid'
    const NEW_NAME = 'tatumrandomtest'

    beforeAll(async () => {
      tatumSdk = await TatumSDK.init({
        ...config,
        network: Network.BINANCE_SMART_CHAIN,
      })
    })

    afterAll(async () => {
      await tatumSdk.destroy()
    })

    it('should check availability of the domain name', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).isDomainAvailable(NEW_NAME, privateKey)
      expect(result).toBe(true)
    })

    it('should query registration fee of the domain', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getRegistrationFee(NEW_NAME, 1, privateKey)
      expect(result?.gt(0)).toBe(true)
    })

    it('should fail to register new domain due to unavailability', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).registerDomain(BSC_NAME, 1, privateKey)
      expect(result).toBe(false)
    })
  })
})
