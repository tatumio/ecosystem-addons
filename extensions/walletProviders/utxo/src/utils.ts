import { Network } from '@tatumio/tatum'
import { DERIVATION_PATHS, NETWORK_CONFIG } from './consts'

export const getDefaultDerivationPath = (network: Network): string =>
  DERIVATION_PATHS.get(network) as string

export const getNetworkConfig = (network: Network): NetworkConfig =>
  NETWORK_CONFIG.get(network) as NetworkConfig

interface Bip32 {
  public: number
  private: number
}

export interface NetworkConfig {
  messagePrefix: string
  bech32: string
  bip32: Bip32
  pubKeyHash: number
  scriptHash: number
  wif: number
}
