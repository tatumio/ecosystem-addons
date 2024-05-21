import { Ethereum, Network, TatumSDK } from '@tatumio/tatum'
import BigNumber from 'bignumber.js'
import { TransactionSimulator } from './extension'
import { TokenTransferDetail } from './types'

const testData = [{
    network: Network.ETHEREUM,
    native: {
        fromAddress: '0xDce92f40cAdDE2C4e3EA78b8892c540e6bFe2f81',
        toAddress: '0x0Ae9E7437092BB7E7Bd6Eccf0eF1ad05591f5B47'
    },
      token: {
          fromAddress: '0xDce92f40cAdDE2C4e3EA78b8892c540e6bFe2f81',
          toAddress: '0xaf758da9f7bdaa7590175193388e9c99427cc2d2',
          tokenContractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          data: '0xa9059cbb000000000000000000000000af758da9f7bdaa7590175193388e9c99427cc2d200000000000000000000000000000000000000000000000000000000001e8480',
          details: {
              name: 'TetherUSD',
              symbol: 'USDT',
              decimals: 6,
          }
      }
  },
    {
        network: Network.CHILIZ,
        native: {
            fromAddress: '0x72917f88100893b3ba5a3d338c9176621ac3a01d',
            toAddress: '0x3a7927bf4870309efc957b30ef9a655292369515'
        },
        token: {
            fromAddress: '0xaaADB5a0bD733CDb9c1f61Be20Ed648D2809b476',
            toAddress: '0xce04d9bcfe631fdfc1ba23c42b5c72a2f2c3872d',
            tokenContractAddress: '0xd1723eb9e7c6ee7c7e2d421b2758dc0f2166eddc',
            data: '0xa9059cbb000000000000000000000000ce04d9bcfe631fdfc1ba23c42b5c72a2f2c3872d0000000000000000000000000000000000000000000000000000000000000002',
            details: {
                name: 'Flamengo',
                symbol: 'MENGO',
                decimals: 0,
            }
        }
    }
]

describe.each(testData)('Transaction Simulator - $network', (testData) => {
  let tatumSdk: Ethereum

  beforeAll(async () => {
    tatumSdk = await TatumSDK.init({
      network: testData.network,
      configureExtensions: [TransactionSimulator],
      verbose: true,
    })
  })

  afterAll(async () => {
    await tatumSdk.destroy()
  })

  describe('simulateTransfer', () => {
      it('should simulate native transaction', async () => {
          const fromAddress = testData.native.fromAddress
          const toAddress = testData.native.toAddress
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
                      from: expect.any(BigNumber),
                      to: expect.any(BigNumber),
                  },
                  [toAddress]: {
                      from: expect.any(BigNumber),
                      to: expect.any(BigNumber),
                  },
              },
          })
          expect(
              result.balanceChanges[fromAddress].from.minus(result.balanceChanges[fromAddress].to).toNumber(),
          ).toBeGreaterThanOrEqual(value)
          expect(
              result.balanceChanges[toAddress].to.minus(result.balanceChanges[toAddress].from).toNumber(),
          ).toBe(value)
      })
  })
    describe('simulateTransferErc20', () => {
      it('should simulate token transaction', async () => {
        const fromAddress = testData.token.fromAddress
        const toAddress = testData.token.toAddress
        const value = 2
        const tokenContractAddress = testData.token.tokenContractAddress
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
            data: testData.token.data,
            gasLimit: expect.any(Number),
            gasPrice: expect.any(Number),
            tokenContractAddress: tokenContractAddress,
          },
          status: 'success',
          balanceChanges: {
            [fromAddress]: {
              from: expect.any(BigNumber),
              to: expect.any(BigNumber),
            },
          },
          tokenTransfers: {
            [tokenContractAddress]: {
              name: testData.token.details.name,
              symbol: testData.token.details.symbol,
              decimals: testData.token.details.decimals,
              [fromAddress]: {
                from: expect.any(BigNumber),
                to: expect.any(BigNumber),
              },
              [toAddress]: {
                from: expect.any(BigNumber),
                to: expect.any(BigNumber),
              },
            },
          },
        })
        expect(
          (result.tokenTransfers[tokenContractAddress][fromAddress] as TokenTransferDetail).from
            .minus((result.tokenTransfers[tokenContractAddress][fromAddress] as TokenTransferDetail).to)
            .toNumber(),
        ).toBe(value)
        expect(
          (result.tokenTransfers[tokenContractAddress][toAddress] as TokenTransferDetail).to
            .minus((result.tokenTransfers[tokenContractAddress][toAddress] as TokenTransferDetail).from)
            .toNumber(),
        ).toBe(value)
      })
    })
  })
