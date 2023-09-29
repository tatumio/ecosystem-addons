import { Network } from '@tatumio/tatum'

export const ADDR_PREFIX = '0x'

// TODO: Needs to be double checked, e.g. kucoin, horizen or bsc / missing cronos or palm
const EVM_DERIVATION_PATH_COMMON = "m/44'/60'/0'/0"

export const DERIVATION_PATHS = new Map<Network, string>([
  [Network.ARBITRUM_NOVA, EVM_DERIVATION_PATH_COMMON],
  [Network.ARBITRUM_ONE, EVM_DERIVATION_PATH_COMMON],
  [Network.AURORA, EVM_DERIVATION_PATH_COMMON],
  [Network.BINANCE_SMART_CHAIN, EVM_DERIVATION_PATH_COMMON],
  [Network.ETHEREUM, EVM_DERIVATION_PATH_COMMON],
  [Network.KUCOIN, EVM_DERIVATION_PATH_COMMON],
  [Network.AVALANCHE_C, "m/44'/9000'/0'/0"],
  [Network.BITCOIN, "m/44'/0'/0'/0"],
  [Network.BITCOIN_CASH, "m/44'/145'/0'/0"],
  [Network.CARDANO, "m/1852'/1815'/0'"],
  [Network.CELO, "m/44'/52752'/0'/0"],
  [Network.DOGECOIN, "m/44'/3'/0'/0"],
  [Network.HORIZEN_EON, "m/44'/121'/0'/0"],
  [Network.ETHEREUM_CLASSIC, "m/44'/61'/0'/0"],
  [Network.FANTOM, "m/44'/1007'/0'/0"],
  [Network.FLOW, "m/44'/539'/0'/0"],
  [Network.GNOSIS, "m/44'/700'/0'/0"],
  [Network.HAQQ, "m/44'/1348'/0'/0"],
  [Network.HARMONY_ONE_SHARD_0, "m/44'/1023'/0'/0"],
  [Network.KLAYTN, "m/44'/8217'/0'/0"],
  [Network.LITECOIN, "m/44'/2'/0'/0"],
  [Network.MULTIVERSX, "m/44'/508'/0'/0'"],
  [Network.OASIS, "m/44'/474'/0'/0'"],
  [Network.POLYGON, "m/44'/966'/0'/0"],
  [Network.SOLANA, "m/44'/501'/0'/0'"],
  [Network.TRON, "m/44'/195'/0'/0"],
  [Network.VECHAIN, "m/44'/818'/0'/0"],
  [Network.XDC, "m/44'/550'/0'/0"],
  [Network.XRP, "m/44'/144'/0'/0"],
  [Network.ZILLIQA, "m/44'/313'/0'/0"],
  [Network.ETHEREUM_SEPOLIA, "TODO"], //TODO: missing
  [Network.ETHEREUM_GOERLI, "TODO"], //TODO: missing
  [Network.AVALANCHE_C_TESTNET, "TODO"], //TODO: missing
  [Network.POLYGON_MUMBAI, "TODO"], //TODO: missing
  [Network.GNOSIS_TESTNET, "TODO"], //TODO: missing
  [Network.FANTOM_TESTNET, "TODO"], //TODO: missing
  [Network.AURORA_TESTNET, "TODO"], //TODO: missing
  [Network.CELO_ALFAJORES, "TODO"], //TODO: missing
  [Network.BINANCE_SMART_CHAIN_TESTNET, "TODO"], //TODO: missing
  [Network.VECHAIN_TESTNET, "TODO"], //TODO: missing
  [Network.XDC_TESTNET, "TODO"], //TODO: missing
  [Network.PALM, "TODO"], //TODO: missing
  [Network.PALM_TESTNET, "TODO"], //TODO: missing
  [Network.CRONOS, "TODO"], //TODO: missing
  [Network.CRONOS_TESTNET, "TODO"], //TODO: missing
  [Network.KUCOIN_TESTNET, "TODO"], //TODO: missing
  [Network.OASIS_TESTNET, "TODO"], //TODO: missing
  [Network.OPTIMISM, "TODO"], //TODO: missing
  [Network.OPTIMISM_TESTNET, "TODO"], //TODO: missing
  [Network.HARMONY_ONE_TESTNET_SHARD_0, "TODO"], //TODO: missing
  [Network.KLAYTN_BAOBAB, "TODO"], //TODO: missing
  [Network.FLARE_COSTON, "TODO"], //TODO: missing
  [Network.FLARE_COSTON_2, "TODO"], //TODO: missing
  [Network.FLARE, "TODO"], //TODO: missing
  [Network.FLARE_SONGBIRD, "TODO"], //TODO: missing
  [Network.HAQQ_TESTNET, "TODO"], //TODO: missing
  [Network.ARBITRUM_NOVA_TESTNET, "TODO"], //TODO: missing
  [Network.HORIZEN_EON_GOBI, "TODO"], //TODO: missing
  [Network.CHILIZ, "TODO"] //TODO: missing
])
