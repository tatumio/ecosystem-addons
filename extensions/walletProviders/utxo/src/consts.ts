import { Network } from '@tatumio/tatum'
import { NetworkConfig } from './types'

export const DERIVATION_PATHS = new Map<Network, string>([
  [Network.BITCOIN, "m/44'/0'/0'/0"],
  [Network.BITCOIN_TESTNET, "m/44'/0'/0'/0"],
  [Network.LITECOIN, "m/44'/2'/0'/0"],
  [Network.LITECOIN_TESTNET, "m/44'/2'/0'/0"],
  [Network.DOGECOIN, "m/44'/3'/0'/0"],
  [Network.DOGECOIN_TESTNET, "m/44'/3'/0'/0"],
])

export const NETWORK_CONFIG = new Map<Network, NetworkConfig>([
  [
    Network.BITCOIN,
    {
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bech32: 'bc',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
      },
      pubKeyHash: 0x00,
      scriptHash: 0x05,
      wif: 0x80,
    },
  ],
  [
    Network.BITCOIN_TESTNET,
    {
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bech32: 'tb',
      bip32: {
        public: 0x043587cf,
        private: 0x04358394,
      },
      pubKeyHash: 0x6f,
      scriptHash: 0xc4,
      wif: 0xef,
    },
  ],
  [
    Network.LITECOIN,
    {
      messagePrefix: '\x18Litecoin Signed Message:\n',
      bech32: '',
      bip32: {
        public: 0x019da462,
        private: 0x019d9cfe,
      },
      pubKeyHash: 0x30,
      scriptHash: 0x32,
      wif: 0xb0,
    },
  ],
  [
    Network.LITECOIN_TESTNET,
    {
      messagePrefix: '\x18Litecoin Signed Message:\n',
      bech32: '',
      bip32: {
        public: 0x0436f6e1,
        private: 0x0436ef7d,
      },
      pubKeyHash: 0x6f,
      scriptHash: 0x3a,
      wif: 0xef,
    },
  ],
  [
    Network.DOGECOIN,
    {
      messagePrefix: '\x18Dogecoin Signed Message:\n',
      bech32: '',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
      },
      pubKeyHash: 0x1e,
      scriptHash: 0x16,
      wif: 0x9e,
    },
  ],
  [
    Network.DOGECOIN_TESTNET,
    {
      messagePrefix: '\x18Dogecoin Signed Message:\n',
      bech32: '',
      bip32: {
        public: 0x043587cf,
        private: 0x04358394,
      },
      pubKeyHash: 0x71,
      scriptHash: 0xc4,
      wif: 0xf1,
    },
  ],
])
