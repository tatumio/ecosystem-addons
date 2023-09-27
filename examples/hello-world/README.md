# 🌍 Hello World Extension

The Hello World Extension serves as a foundational example for extension use cases.

## 📖 Description

The Hello World Extension offers a singular method:

- `sayHello()`: This method displays a welcome message and the base fee for Ethereum.

This extension is exclusively compatible with `Ethereum`, a constraint ensured by the validation within its `init()` method.

## 🚀 Quick Start

Install the package in your application that is using `@tatumio/tatum` SDK already in a way of your choice, e.g.:

`npm install @tatumio/hello-world`

OR

`yarn add @tatumio/hello-world`

## 🛠️ How to Use

In your application, utilize the extension as depicted below:

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

### 🖨️ Output

```
[HelloWorldExtension] initialised
[HelloWorldExtension] Hello World
[HelloWorldExtension] Getting network from TatumSDK configuration: ethereum-sepolia
[HelloWorldExtension] Getting base fee for the network from TatumSDK FeeEvm module: 10.735841739
[HelloWorldExtension] Base Fee for ethereum-sepolia is 10.735841739
[HelloWorldExtension] disposed
```

## 📦 @tatumio/tatum Package

The Tatum SDK package should be set as a dev dependency within the extension.
