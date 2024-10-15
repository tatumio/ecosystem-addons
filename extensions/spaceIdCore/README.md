# 🌍 SPACE ID Core

The SPACE ID Core extension integrates seamlessly with Tatum SDK to provide core SPACE ID SDK functionalities.

## 📖 Description

The SPACE ID Core extension aims to bring the [Web3 Name SDK](https://docs.space.id) to Tatum, providing developers with a multi-chain name service to easily build and create a web3 identity without any blockchain knowledge due to the integration with Tatum RPC services and libraries.

- [Web3 Name SDK Core](https://docs.space.id/developer-guide/web3-name-sdk/web3-name-sdk): The extension supports various reading methods for discovering already existing domains (e.g. getting domain name by address or vice versa) and their metadata (e.g. avatar or hash content).
- [Registration Integration](https://docs.space.id/developer-guide/registration-integration): The extension also supports registering a new domain along with all the related utils (e.g. finding out if the domain is available in the first place or querying the registration fee of the domain).

## 🚀 Quick Start

1. **Installation**

   Firstly, ensure that `viem` and the `@tatumio/space-id-core` package is set as a dependency within your project. Next, import the SPACE ID extension:

   ```typescript
   import { SpaceIdCore } from '@tatumio/space-id-core';
   ```

2. **Initialization**

   Create an instance of Tatum SDK passing `SpaceIdCore` as one of extensions.

   ```typescript
    const tatumSdk = await TatumSDK.init<Ethereum>({
      network: Network.ETHEREUM,
      configureExtensions: [SpaceIdCore]
    })
   ```

## 🛠️ How to Use

The SPACE ID Core extension provides most [Web3 Name SDK Core](https://docs.space.id/developer-guide/web3-name-sdk/web3-name-sdk) and [Registration](https://docs.space.id/developer-guide/registration-integration) methods. It should therefore be possible to use almost anything mentioned in the SPACE ID docs with only minimal changes.

### Get address by domain name example:

```typescript
import { TatumSDK, Network, Solana } from "@tatumio/tatum";
import { SpaceIdCore } from "@tatumio/space-id-core";

const tatum = await TatumSDK.init<Solana>({
  network: Network.SOLANA,
  configureExtensions: [SpaceIdCore],
  apiKey: ****,
});

try {
  const result = await tatum.extension(SpaceIdCore).getAddress("spaceid");
  console.log(result);
} catch (e) {
  console.error(e);
}

tatum.destroy();
```

### Get domain name by address example:

```typescript
import { TatumSDK, Network, Ethereum } from "@tatumio/tatum";
import { SpaceIdCore } from "@tatumio/space-id-core";

const tatum = await TatumSDK.init<Ethereum>({
  network: Network.ETHEREUM,
  configureExtensions: [SpaceIdCore],
  apiKey: ****,
});

try {
  const result = await tatum
    .extension(SpaceIdCore)
    .getDomainName("0x5228BC5B84754f246Fc7265787511ae9C0afEBC5");
  console.log(result);
} catch (e) {
  console.error(e);
}

tatum.destroy();
```

### Register a new domain example:

```typescript
import { TatumSDK, Network, ArbitrumOne } from "@tatumio/tatum";
import { SpaceIdCore } from "@tatumio/space-id-core";

const tatum = await TatumSDK.init<ArbitrumOne>({
  network: Network.ARBITRUM_ONE,
  configureExtensions: [SpaceIdCore],
  apiKey: ****,
});
const privateKey = ****

try {
  await tatum.extension(SpaceIdCore).registerDomain('spaceid', 1, privateKey)
} catch (e) {
  console.error(e);
}

tatum.destroy();
```

## 🔗🔗 Supported Networks

The extension can be initialized on the following chains:

```typescript
Network.ETHEREUM,
Network.ARBITRUM_ONE,
Network.BINANCE_SMART_CHAIN,
Network.GNOSIS,
Network.SOLANA,
```

However, different methods have different support as detailed below.

### Web3 Name SDK Core

Methods for getting address by domain name and vice versa are supported on all the chains listed above. However, every other method such as getting domain metadata is currently **NOT** available on Solana (`Network.SOLANA`).

### Registration Integration

Registration of new domain and all the utilities around it as detailed above are supported on the following chains:

```typescript
Network.ETHEREUM,
Network.ARBITRUM_ONE,
Network.BINANCE_SMART_CHAIN,
```
