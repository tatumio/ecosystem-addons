# ⚙️️ Configurable Extension

The Configurable Extension showcases an example where the extension can be tailored to user preferences.

## 📖 Description

The Configurable Extension comes equipped with one distinct method:

- `sayHelloWithConfiguration()`: This method displays a welcome message, the base fee for Ethereum, and a user-defined string.

This extension exclusively operates with `Ethereum`, a requirement validated within its `init()` method.

## 🚀 Quick Start

To compile this extension locally, execute the following steps:

```bash
yarn install
yarn build
yarn pack
```

Keep a record of the output path for the .tgz file. You'll refer to it when updating the `package.json` of your test application.

## 🛠️ How to Use

In your application, incorporate the extension as outlined:

```typescript
const tatumSdk = await TatumSDK.init<Ethereum>({
  network: Network.ETHEREUM_SEPOLIA,
  version: ApiVersion.V3,
  configureExtensions: [
    {type: ConfigurableExtension, config: {configurationValue: 'CONFIGURED VALUE'}},
  ]
})

await tatumSdk.extension(ConfigurableExtension).sayHelloWithConfiguration()
```

### 🖨️ Output

```
[ConfigurableExtension] initialised
[ConfigurableExtension] Hello World
[ConfigurableExtension] Getting network from TatumSDK configuration: ethereum-sepolia
[ConfigurableExtension] Getting string from ConfigurableExtension configuration: CONFIGURED VALUE
[ConfigurableExtension] Getting base fee for the network from TatumSDK FeeEvm module: 10.735841739
[ConfigurableExtension] Base Fee for ethereum-sepolia is 10.735841739
[ConfigurableExtension] disposed
```

## 📦 @tatumio/tatum Package

The Tatum SDK package should be enlisted as a dev dependency within the extension.
