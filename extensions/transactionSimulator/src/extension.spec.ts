import { Ethereum, Network, TatumSDK } from '@tatumio/tatum'
import { TransactionSimulator } from './extension'

describe('Transaction Simulator', () => {
  let tatumSdk: Ethereum

  beforeEach(async () => {
    tatumSdk = await TatumSDK.init<Ethereum>({
      network: Network.ETHEREUM,
      configureExtensions: [TransactionSimulator],
      verbose: true,
    })
  })

  afterAll(async () => {
    await tatumSdk.destroy()
  })

  describe('simulateTransfer', () => {
    it('should simulate native transaction', async () => {
      const fromAddress = '0xDce92f40cAdDE2C4e3EA78b8892c540e6bFe2f81'
      const toAddress = '0x0Ae9E7437092BB7E7Bd6Eccf0eF1ad05591f5B47'
      const value = 10000

      const txRequest = {
        from: fromAddress,
        to: toAddress,
        value: value,
      }
      const result = await tatumSdk.extension(TransactionSimulator).simulateTransfer(txRequest)
      expect(result).toEqual({
        transactionDetails: {
          from: fromAddress,
          to: toAddress,
          value: value,
          gasLimit: expect.any(Number),
          gasPrice: expect.any(Number),
        },
        status: 'success',
        balanceChanges: {
          [fromAddress]: {
            from: expect.any(Number),
            to: expect.any(Number),
          },
          [toAddress]: {
            from: expect.any(Number),
            to: expect.any(Number),
          },
        },
      })
      expect(
        result.balanceChanges[fromAddress].from - result.balanceChanges[fromAddress].to,
      ).toBeGreaterThanOrEqual(value)
      expect(result.balanceChanges[toAddress].to - result.balanceChanges[toAddress].from).toBe(value)
    })
    describe('simulateTransferErc20', () => {
      it('should simulate token transaction', async () => {
        const fromAddress = '0xDce92f40cAdDE2C4e3EA78b8892c540e6bFe2f81'
        const toAddress = '0xaf758da9f7bdaa7590175193388e9c99427cc2d2'
        const value = 420
        const tokenContractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
        const txRequest = {
          from: fromAddress,
          to: toAddress,
          value: value,
          tokenContractAddress: tokenContractAddress,
        }
        const result = await tatumSdk.extension(TransactionSimulator).simulateTransferErc20(txRequest)
        expect(result).toEqual({
          transactionDetails: {
            from: fromAddress,
            to: toAddress,
            data: '0xa9059cbb000000000000000000000000af758da9f7bdaa7590175193388e9c99427cc2d2000000000000000000000000000000000000000000000000000000001908b100',
            gasLimit: expect.any(Number),
            gasPrice: expect.any(Number),
            tokenContractAddress: tokenContractAddress,
          },
          status: 'success',
          balanceChanges: {
            [fromAddress]: {
              from: expect.any(Number),
              to: expect.any(Number),
            },
          },
          tokenTransfers: {
            [tokenContractAddress]: {
              name: 'TetherUSD',
              symbol: 'USDT',
              decimals: 6,
              [fromAddress]: {
                from: expect.any(Number),
                to: expect.any(Number),
              },
              [toAddress]: {
                from: expect.any(Number),
                to: expect.any(Number),
              },
            },
          },
        })
      })
    })
  })
})
