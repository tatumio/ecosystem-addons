import { Network } from '@tatumio/tatum'

export const ADDR_PREFIX = '0x'

export const TESTNET_DERIVATION_PATH = "m/44'/1'/0'/0"

const EVM_DERIVATION_PATH_COMMON = "m/44'/60'/0'/0"

export const DERIVATION_PATHS = new Map<Network, string>([
  [Network.ARBITRUM_NOVA, EVM_DERIVATION_PATH_COMMON],
  [Network.ARBITRUM_ONE, EVM_DERIVATION_PATH_COMMON],
  [Network.AURORA, EVM_DERIVATION_PATH_COMMON],
  [Network.AVALANCHE_C, "m/44'/9005'/0'/0"],
  [Network.BINANCE_SMART_CHAIN, "m/44'/9006'/0'/0"],
  [Network.CELO, "m/44'/52752'/0'/0"],
  [Network.CHILIZ, "m/44'/2182'/0'/0"],
  [Network.CRONOS, "m/44'/394'/0'/0"],
  [Network.ETHEREUM, EVM_DERIVATION_PATH_COMMON],
  [Network.ETHEREUM_CLASSIC, "m/44'/61'/0'/0"],
  [Network.FANTOM, "m/44'/1007'/0'/0"],
  [Network.FLARE, EVM_DERIVATION_PATH_COMMON],
  [Network.GNOSIS, "m/44'/700'/0'/0"],
  [Network.HAQQ, "m/44'/1348'/0'/0"],
  [Network.HARMONY_ONE_SHARD_0, "m/44'/1023'/0'/0"],
  [Network.HORIZEN_EON, "m/44'/121'/0'/0"],
  [Network.KLAYTN, "m/44'/8217'/0'/0"],
  [Network.KUCOIN, "m/44'/641'/0'/0"],
  [Network.OASIS, "m/44'/474'/0'/0'"],
  [Network.OPTIMISM, EVM_DERIVATION_PATH_COMMON],
  [Network.PALM, EVM_DERIVATION_PATH_COMMON],
  [Network.POLYGON, "m/44'/966'/0'/0"],
  [Network.VECHAIN, "m/44'/818'/0'/0"],
  [Network.XINFIN, "m/44'/550'/0'/0"],
])
