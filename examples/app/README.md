# 🛠️ Example Application

This is an example application demonstrating the use of various extensions. Dive in to learn more!

## 📦 Extensions Used
- [🌍 hello-world](../../examples/hello-world/README.md)
- [⚙️ configurable-extension](../../examples/configurable-extension/README.md)

## 🚀 Quick Start

### 1. Pack the Extensions
For both extensions mentioned above:
1. Follow their respective Quick Start sections.
2. Update the `package.json` with local .tgz paths:

```
"@tatumio/hello-world": "path_to_local.tgz",
"@tatumio/configurable-extension": "path_to_local.tgz",
```

### 2. Run the Example

After setting up, execute the following:

```bash
yarn install
yarn example
```

## 📖 Description

The application comprises the following packages:
- @tatumio/tatum
- @tatumio/hello-world
- @tatumio/configurable-extension

### Initialization

The application initializes Tatum SDK with two extensions:

```typescript
const tatumSdk = await TatumSDK.init<Ethereum>({
    network: Network.ETHEREUM_SEPOLIA,
    version: ApiVersion.V3,
    configureExtensions: [
        HelloWorldExtension,
        {type: ConfigurableExtension, config: {configurationValue: 'CONFIGURED VALUE'}},
    ]
})
```

### Method Calls

1. It invokes the `sayHello()` method from `HelloWorldExtension`:
```typescript
await tatumSdk.extension(HelloWorldExtension).sayHello()
```

2. It then calls the `sayHelloWithConfiguration()` method from `ConfigurableExtension`:

```typescript
await tatumSdk.extension(ConfigurableExtension).sayHelloWithConfiguration()
```

### Cleanup

Finally, it disposes the SDK, which also disposes all extensions:

```typescript
tatumSdk.dispose()
```

### 🖨️ Output

```
[HelloWorldExtension] initialised
[ConfigurableExtension] initialised
[HelloWorldExtension] Hello World
[HelloWorldExtension] Getting network from TatumSDK configuration: ethereum-sepolia
[HelloWorldExtension] Getting base fee for the network from TatumSDK FeeEvm module: 10.735841739
[HelloWorldExtension] Base Fee for ethereum-sepolia is 10.735841739
[ConfigurableExtension] Hello World
[ConfigurableExtension] Getting network from TatumSDK configuration: ethereum-sepolia
[ConfigurableExtension] Getting string from ConfigurableExtension configuration: CONFIGURED VALUE
[ConfigurableExtension] Getting base fee for the network from TatumSDK FeeEvm module: 10.735841739
[ConfigurableExtension] Base Fee for ethereum-sepolia is 10.735841739
[HelloWorldExtension] disposed
[ConfigurableExtension] disposed
```