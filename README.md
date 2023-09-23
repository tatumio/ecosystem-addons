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

## 🛠️ Crafting Extensions

### The `TatumSdkExtension` Abstract Class

All extensions must extend the `TatumSdkExtension` abstract class. 
This class provides the following:

```typescript
export abstract class TatumSdkExtension {
    protected constructor(
        protected readonly tatumSdkContainer: TatumSdkContainer) {
    }

    abstract init(...args: unknown[]): Promise<void>
    abstract destroy(): void
}
```

- The `init` method is called and awaited during Tatum SDK initialization.
- The `destroy` method is called during Tatum SDK destruction.
- The `tatumSdkContainer` property provides access to the instance specific `TatumSdkContainer`.

### `TatumSdkContainer` Class

The `TatumSdkContainer` class provides access to the SDK configuration and internal sub-modules along with other registered extensions.

```typescript
export interface ITatumSdkContainer {
    get<T>(type: ServiceConstructor<T>): T
    getConfig(): TatumConfig
}
```

Example of extension constructor for extension depending on SDK configuration and `FeeEvm` sub-module:

```
constructor(tatumSdkContainer: TatumSdkContainer) {
    super(tatumSdkContainer)
    this.fee = this.tatumSdkContainer.get(FeeEvm)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
  }
```

### Config-Centric Extensions

If your extension needs to be configured by the user, you can pass any object to the extension constructor as the configuration.

```
constructor(tatumSdkContainer: TatumSdkContainer, private readonly config: { configurationValue: string }) {
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

### 🔄 Extension Lifecycle

The extension lifecycle is managed by the Tatum SDK.

- The `init` method is called and awaited during Tatum SDK initialization.
- The `destroy` method is called during Tatum SDK destruction.

## 🎨 Extension Showcases

- 🌍 [Hello World Extension](./examples/hello-world/README.md)
- ⚙️ [Configurable Extension](./examples/configurable-extension/README.md) - Tailor-made as per user preferences.

### 📱 App Sample Incorporating Tatum SDK and Extensions

- [App Exploration](./examples/app/README.md)