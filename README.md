# 🌐 Extension Ecosystem

This repository is a treasure trove of extensions designed for integration with the [Tatum SDK](https://github.com/tatumio/tatum-js).

## 🚀 How to Use Extensions

Extensions are published as npm packages. You can install them like any other package. 
For example:

```bash
yarn add @tatumio/hello-world
```

During the Tatum SDK initialization phase, introduce the desired extension to the `configureExtensions` list:

```typescript
const tatumSdk = await TatumSDK.init<Ethereum>({
    network: Network.ETHEREUM_SEPOLIA,
    configureExtensions: [
        HelloWorldExtension,
    ]
})
```

After that, you can use the extension in your code:

```typescript
await tatumSdk.extension(HelloWorldExtension).sayHello()
await tatumSdk.extension(ConfigurableExtension).sayHelloWithConfiguration()
```

## 🛠️ Creating Extensions

### `TatumSdkExtension` Abstract Class

All extensions must extend the `TatumSdkExtension` abstract class. 
This class provides the following:

```typescript
export abstract class TatumSdkExtension {
    protected constructor(
        protected readonly tatumSdkContainer: ITatumSdkContainer) {
    }

    abstract supportedNetworks: Network[]

    init(): Promise<void> { return Promise.resolve(undefined) }
    destroy(): Promise<void> { return Promise.resolve(undefined) }
}
```

- The `init` method is called and awaited during Tatum SDK initialization - **override if needed**.
- The `destroy` method is called and awaited during Tatum SDK destruction - **override if needed**.
- The `tatumSdkContainer` property provides access to the instance specific `TatumSdkContainer`.
- The `supportedNetworks` property needs to be implemented by the extension defining list of supported networks.

### `ITatumSdkContainer` Interface

The `ITatumSdkContainer` interface provides access to the SDK configuration and internal sub-modules along with other registered extensions.

`getRpc` method provides access to the RPC sub-module of the SDK managed based on the SDK configuration (LoadBalancer, archive nodes, etc.). 

```typescript
export interface ITatumSdkContainer {
    get<T>(type: ServiceConstructor<T>): T
    getRpc<T>(): T
    getConfig(): TatumConfig
}
```

Example of extension constructor for extension depending on SDK configuration, `FeeEvm` sub-module and `EvmRpc` sub-module:

```
constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.fee = this.tatumSdkContainer.get(FeeEvm)
    this.evmRpc = this.tatumSdkContainer.getRpc<EvmRpc>()
    this.sdkConfig = this.tatumSdkContainer.getConfig()
  }
```

### User Configurable Extensions

If your extension needs to be configured by the user, you can pass any object to the extension constructor as the configuration.

```
constructor(tatumSdkContainer: ITatumSdkContainer, private readonly config: { configurationValue: string }) {
    super(tatumSdkContainer)
    this.fee = this.tatumSdkContainer.get(FeeEvm)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
  }
```

Then during Tatum SDK initialization, you can pass the configuration object to the `configureExtensions` list:

```typescript
const tatumSdk = await TatumSDK.init<Ethereum>({
    network: Network.ETHEREUM_SEPOLIA,
    configureExtensions: [
        HelloWorldExtension,
        {type: ConfigurableExtension, config: {configurationValue: 'CONFIGURED VALUE'}},
    ]
})
```

### Wallet Provider Extensions

Wallet Provider Extensions is a special type of extension built on top of generic extension.

It provides a way to integrate with the Tatum SDK Wallet Provider accessible via `tatum.walletProvider.use()`.

Wallet Provider Extensions must extend the `TatumSdkWalletProvider<T,P>` abstract class - [check it here](https://github.com/tatumio/tatum-js/blob/master/src/service/extensions/tatumsdk.wallet.providers.dto.ts).

Then it can be used like this:

```typescript
import { TatumSDK, Ethereum, Network, ApiVersion } from '@tatumio/tatum'
import { HelloWorldExtension } from "@tatumio/wallet-provider-demo"

const tatumSdk = await TatumSDK.init<Ethereum>({
    network: Network.ETHEREUM_SEPOLIA,
    configureWalletProviders: [
        WalletProviderDemo,
    ]
})

await tatumSdk.walletProvider.use(WalletProviderDemo).getWallet()
```

### 🔄 Extension Lifecycle

The extension lifecycle is managed by the Tatum SDK.

- The `init` method is called and awaited during Tatum SDK initialization.
- The `destroy` method is called and awaited during Tatum SDK destruction.

Base `TatumSdkExtension` includes empty implementation of those methods, if your extension require some initialization or destruction logic, you can override those methods.

## 🎨 Extension Showcases

- 🌍 [Hello World Extension](./examples/hello-world/README.md)
- ⚙️ [Configurable Extension](./examples/configurable-extension/README.md)

### 📱 App Sample Incorporating Tatum SDK and Extensions

- [App Exploration](./examples/app/README.md)
