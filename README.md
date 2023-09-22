# Extension Ecosystem

This repository contains a collection of extensions that can be used with the [Tatum SDK](https://github.com/tatumio/tatum-js).

## How to use extensions

Extensions are published as npm packages. You can install them using `npm` or `yarn` like any other package. 
For example:

```bash
yarn add @tatumio/hello-world
```

Then during Tatum SDK initialization, you can pass the extension to the `configureExtensions` list:

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

## How to create extensions

### `TatumSdkExtension` abstract class

All extensions must extend the `TatumSdkExtension` abstract class. 
This class provides the following methods:

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

### `TatumSdkContainer` class

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

### Extensions needing configuration

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

### Extension lifecycle

The extension lifecycle is managed by the Tatum SDK.

- The `init` method is called and awaited during Tatum SDK initialization.
- The `destroy` method is called during Tatum SDK destruction.

## Extension examples

- [Hello World extension](./examples/hello-world/README.md)
- [Extension use case where the extension is configurable by the user](./examples/configurable-extension/README.md)

### Application example using Tatum SDK with extensions

- [App Example](./examples/app/README.md)

