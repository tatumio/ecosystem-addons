
# Example Application

Example Application using below extensions:

- [hello-world](../../examples/hello-world/README.md)
- [configurable-extension](../../examples/configurable-extension/README.md)

## Quick Start

### Pack extensions
For both of above extensions follow respective Quick Start sections and edit `package.json` here with local .tgz paths.

```
"@tatumio/hello-world": "path_to_local.tgz",
"@tatumio/configurable-extension": "path_to_local.tgz",
```

then run:

`yarn install`

`yarn example`

## Description

Application has:
- @tatumio/tatum
- @tatumio/hello-world
- @tatumio/configurable-extension 

packages installed.

Application first initializes Tatum SDK with two extensions:
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

Then it calls `sayHello()` method from `HelloWorldExtension`:
```typescript
await tatumSdk.extension(HelloWorldExtension).sayHello()
```

Then it calls `sayHelloWithConfiguration()` method from `ConfigurableExtension`:
```typescript
await tatumSdk.extension(ConfigurableExtension).sayHelloWithConfiguration()
```

At the end it disposes the SDK which disposes all extensions:
```typescript
tatumSdk.dispose()
```

### Output

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