import { TatumSDK, Ethereum, Network, ApiVersion } from '@tatumio/tatum'
import { HelloWorldExtension } from "@tatumio/hello-world"
import { ConfigurableExtension } from "@tatumio/configurable-extension"

const run = async () => {
    const tatumSdk = await TatumSDK.init<Ethereum>({
        network: Network.ETHEREUM_SEPOLIA,
        version: ApiVersion.V3,
        configureExtensions: [
            HelloWorldExtension,
            {type: ConfigurableExtension, config: {configurationValue: 'CONFIGURED VALUE'}},
        ]
    })

    await tatumSdk.extension(HelloWorldExtension).sayHello()
    await tatumSdk.extension(ConfigurableExtension).sayHelloWithConfiguration()

    tatumSdk.destroy()
}

run()