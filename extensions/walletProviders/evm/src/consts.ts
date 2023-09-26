import { Network } from '@tatumio/tatum'

export const ADDR_PREFIX = '0x'

// TODO: Needs to be double checked, e.g. kucoin, horizen or bsc / missing cronos or palm
export const getDefaultDerivationPath = (network: Network) => {
  switch (network) {
    case Network.ARBITRUM_NOVA:
    case Network.ARBITRUM_ONE:
    case Network.AURORA:
    case Network.BINANCE_SMART_CHAIN:
    case Network.ETHEREUM:
    case Network.KUCOIN:
      return "m/44'/60'/0'/0"
    case Network.AVALANCHE_C:
      return "m/44'/9000'/0'/0"
    case Network.BITCOIN:
      return "m/44'/0'/0'/0"
    case Network.BITCOIN_CASH:
      return "m/44'/145'/0'/0"
    case Network.CARDANO:
      return "m/1852'/1815'/0'"
    case Network.CELO:
      return "m/44'/52752'/0'/0"
    case Network.DOGECOIN:
      return "m/44'/3'/0'/0"
    case Network.HORIZEN_EON:
      return "m/44'/121'/0'/0"
    case Network.ETHEREUM_CLASSIC:
      return "m/44'/61'/0'/0"
    case Network.FANTOM:
      return "m/44'/1007'/0'/0"
    case Network.FLOW:
      return "m/44'/539'/0'/0"
    case Network.GNOSIS:
      return "m/44'/700'/0'/0"
    case Network.HAQQ:
      return "m/44'/1348'/0'/0"
    case Network.HARMONY_ONE_SHARD_0:
      return "m/44'/1023'/0'/0"
    case Network.KLAYTN:
      return "m/44'/8217'/0'/0"
    case Network.LITECOIN:
      return "m/44'/2'/0'/0"
    case Network.MULTIVERSX:
      return "m/44'/508'/0'/0'"
    case Network.OASIS:
      return "m/44'/474'/0'/0'"
    case Network.POLYGON:
      return "m/44'/966'/0'/0"
    case Network.SOLANA:
      return "m/44'/501'/0'/0'"
    case Network.TRON:
      return "m/44'/195'/0'/0"
    case Network.VECHAIN:
      return "m/44'/818'/0'/0"
    case Network.XDC:
      return "m/44'/550'/0'/0"
    case Network.XRP:
      return "m/44'/144'/0'/0"
    case Network.ZILLIQA:
      return "m/44'/313'/0'/0"
    default:
      return "m/44'/1'/0'/0"
  }
}
