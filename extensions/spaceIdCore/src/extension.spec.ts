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
    const BIT_ADDR = '0x5228BC5B84754f246Fc7265787511ae9C0afEBC5'
    const AOK_ADDR = '0x8BCBd56588d77cd06C7930c09aB55ca7EF09b395'
    const BIT_NAME = 'bitgetwallet.eth'
    const AOK_NAME = 'aok.eth'

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
      const result = await tatumSdk.extension(SpaceIdCore).getAddress(BIT_NAME)
      expect(result).toBe(BIT_ADDR)
    })

    it('should resolve domain name from address', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getDomainName(BIT_ADDR)
      expect(result).toBe(BIT_NAME)
    })

    it('should resolve multiple domain names from address', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getDomainNames(AOK_ADDR)
      expect(result?.toString()).toBe([AOK_NAME].toString())
    })

    it('should resolve domain names from multiple addresses', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getDomainNameBatch([BIT_ADDR, AOK_ADDR])
      expect(result).toStrictEqual([
        {
          address: BIT_ADDR,
          domain: BIT_NAME,
        },
        {
          address: AOK_ADDR,
          domain: AOK_NAME,
        },
      ])
    })

    it('should fetch text record by domain name and key', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getDomainRecord(BIT_NAME, 'avatar')
      expect(result).toContain(BIT_NAME)
    })

    it('should fetch metadata by domain name', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getMetadata(BIT_NAME)
      expect(result?.name).toBe(BIT_NAME)
    })

    it('should get domain content hash from name', async () => {
      const result = await tatumSdk.extension(SpaceIdCore).getContentHash('ipfs.eth')
      expect(result).toBe('0xe3010170122063031c3edd5ca21e9cf75770e9ccfb545f6eaf2f2edc008cef5816e7ea8ff780')
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
      const result = await tatumSdk.extension(SpaceIdCore).registerDomain('spaceid', 1, privateKey)
      expect(result).toBe(false)
    })
  })
})
