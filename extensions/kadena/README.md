# 🌍 Kadena Utilities by Tatum

Kadena Utilities integrates seamlessly with Tatum SDK to provide easy way to execute higher level actions on Kadena blockchain.

## 📖 Description

The Kadena Utilities is designed to bolster the efficiency and security of blockchain transactions. It offers crucial capabilities such as:

- Minting NFTs on Kadena network
- Burning NFTs on Kadena network
- Transferring KDA between accounts

It is built upon popular packages like `@kadena/client`, ensuring a robust, reliable, and secure foundation for all activities.

## 🚀 Quick Start

1. **Installation**

   Firstly, ensure that the `@tatumio/kadena-utils` package is set as a dependency within your project. Next, import the Kadena Utils extension:

   ```typescript
   import { KadenaUtils } from '@tatumio/kadena-utils';
   ```

2. **Initialization**

   Create an instance of Tatum SDK passing `KadenaUtils` as one of extensions.

   ```typescript
   const tatumSdk = await TatumSDK.init<Kadena>({
        network: Network.KADENA,
        configureExtensions: [
            KadenaUtils,
        ]
    })
   ```

## 🛠️ How to Use

KadenaUtils provides range of methods to streamline Kadena network interactions. Below is a guide on how to utilize these functionalities:

### Transfer KDA:

```typescript
import { Kadena, Network, TatumSDK } from "@tatumio/tatum";
import { KadenaUtils } from "@tatum/kadena-utils";
import { KadenaWalletProvider } from "@tatumio/kadena-wallet-provider";

const tatumSdk = await TatumSDK.init<Kadena>({
  network: Network.KADENA_TESTNET,
  configureExtensions: [KadenaUtils],
  configureWalletProviders: [KadenaWalletProvider]
  })

const kadenaTransferParams : KadenaTransferParams = {
  senderAccount: 'your-sender-account',
  receiverAccount: 'your-receiver-account',
  amount: '1000000000000000000',
  senderPublicKey: 'your-sender-public-key',
  chainId: '1'
}

const secretKey = 'your-secret-key';

const command = await tatumSdk.extension(KadenaUtils).transferKadena(kadenaTransferParams)
const txId = await tatumSdk.walletProvider.use(KadenaWalletProvider).signAndBroadcast({command, secretKey})

console.log(txId)
```

### Mint NFT:


```typescript
import { Kadena, Network, TatumSDK } from "@tatumio/tatum";
import { KadenaUtils } from "@tatum/kadena-utils";
import { KadenaWalletProvider } from "@tatumio/kadena-wallet-provider";

const tatumSdk = await TatumSDK.init<Kadena>({
  network: Network.KADENA_TESTNET,
  configureExtensions: [KadenaUtils],
  configureWalletProviders: [KadenaWalletProvider]
  })

const uri = 'ipfs://example-uri';
const secretKey = 'your-secret-key';
const publicKey = 'your-public-key';
const chainId = '1'

const command = await tatumSdk.extension(KadenaUtils).mintBasicNFT(uri, publicKey, chainId)
const txId = await tatumSdk.walletProvider.use(KadenaWalletProvider).signAndBroadcast({command, secretKey})

console.log(txId)
```

### Burn NFT:


```typescript
import { Kadena, Network, TatumSDK } from "@tatumio/tatum";
import { KadenaUtils } from "@tatum/kadena-utils";
import { KadenaWalletProvider } from "@tatumio/kadena-wallet-provider";

const tatumSdk = await TatumSDK.init<Kadena>({
  network: Network.KADENA_TESTNET,
  configureExtensions: [KadenaUtils],
  configureWalletProviders: [KadenaWalletProvider]
  })

const uri = 'ipfs://example-uri';
const secretKey = 'your-secret-key';
const publicKey = 'your-public-key';
const chainId = '1'
const tokenId = 'your-token-id'

const command = await tatumSdk.extension(KadenaUtils).burnNFT(tokenId, publicKey, chainId)
const txId = await tatumSdk.walletProvider.use(KadenaWalletProvider).signAndBroadcast({command, secretKey})

console.log(txId)
```

## 🔗🔗 Supported Networks

```typescript
Network.KADENA,
Network.KADENA_TESTNET
```
