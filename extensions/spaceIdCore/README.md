# 🌍 SPACE ID Core

The SPACE ID Core extension integrates seamlessly with Tatum SDK to provide core SPACE ID SDK functionalities.

## 📖 Description

...

- ...

## 🚀 Quick Start

1. **Installation**

   Firstly, ensure that the `@tatumio/space-id-core` package is set as a dependency within your project. Next, import the SPACE ID extension:

   ```typescript
   import { SpaceIdCore } from '@tatumio/space-id-core';
   ```

2. **Initialization**

   Create an instance of Tatum SDK passing `SpaceIdCore` as one of extensions.

   ```typescript
    const tatumSdk = await TatumSDK.init<Ethereum>({
        network: Network.ETHEREUM_MAINNET,
        configureExtensions: [
            SpaceIdCore,
        ]
    })
   ```

## 🛠️ How to Use

The SPACE ID Core provides methods to ...

### Example:

```typescript
import { Ethereum, Network, TatumSDK } from "@tatumio/tatum";
import { SpaceIdCore } from "@tatum/space-id-core";

const tatumSdk = await TatumSDK.init<Ethereum>({
  network: Network.ETHEREUM,
  configureExtensions: [SpaceIdCore]
})

...
```

## 🔗🔗 Supported Networks

```typescript
Network.ETHEREUM,
...
```
