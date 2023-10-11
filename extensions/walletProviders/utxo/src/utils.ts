import { Network } from '@tatumio/tatum'
import BigNumber from 'bignumber.js'
import { DERIVATION_PATHS, NETWORK_CONFIG } from './consts'
import { NetworkConfig } from './types'

export const getDefaultDerivationPath = (network: Network): string => DERIVATION_PATHS.get(network) as string

export const getNetworkConfig = (network: Network): NetworkConfig =>
  NETWORK_CONFIG.get(network) as NetworkConfig

export const toSatoshis = (amount: number | string): number => {
  const amountBigNumber = new BigNumber(amount)
  const satoshiValue = amountBigNumber.multipliedBy(10 ** 8)
  const satoshis = satoshiValue.integerValue()
  if (satoshis.toFixed() !== satoshiValue.toFixed() || satoshis.lt(0)) {
    throw new Error(`Invalid amount ${amountBigNumber.toString()}`)
  }
  return Number(satoshis)
}

export const fromSatoshis = (amount: number | string): number =>
  new BigNumber(amount).dividedBy(10 ** 8).toNumber()
