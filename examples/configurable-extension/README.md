# Configurable Extension

Configurable Extension is a use case where the extension is configurable by the user.

## Description

Configurable Extension provides one method:

- `sayHelloWithConfiguration()` - method prints welcome method, base fee for Ethereum and user defined string.

Extension only works with Network.ETHEREUM which is enforced by validation inside it's `init()`

## Quick Start

To create local package follow below steps:

`yarn install`

`yarn build`

`yarn pack`

Take note of the output path for the .tgz file for later use in `package.json` of a test application.

## How to use

In you application you can use the extensions as follows:

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

### Output

```
[ConfigurableExtension] initialised
[ConfigurableExtension] Hello World
[ConfigurableExtension] Getting network from TatumSDK configuration: ethereum-sepolia
[ConfigurableExtension] Getting string from ConfigurableExtension configuration: CONFIGURED VALUE
[ConfigurableExtension] Getting base fee for the network from TatumSDK FeeEvm module: 10.735841739
[ConfigurableExtension] Base Fee for ethereum-sepolia is 10.735841739
[ConfigurableExtension] disposed
```

## @tatumio/tatum package

Tatum SDK package should be used as a dev dependency in the extension.
