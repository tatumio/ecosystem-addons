# Hello World Extension

Hello World Extension is the most basic extension use case.

## Description

Hello World Extension provides one method:

- `sayHello()` - method prints welcome method and base fee for Ethereum

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
    HelloWorldExtension,
  ]
})

await tatumSdk.extension(HelloWorldExtension).sayHello()
```

### Output

```
[HelloWorldExtension] initialised
[HelloWorldExtension] Hello World
[HelloWorldExtension] Getting network from TatumSDK configuration: ethereum-sepolia
[HelloWorldExtension] Getting base fee for the network from TatumSDK FeeEvm module: 10.735841739
[HelloWorldExtension] Base Fee for ethereum-sepolia is 10.735841739
[HelloWorldExtension] disposed
```

## @tatumio/tatum package

Tatum SDK package should be used as a dev dependency in the extension.
