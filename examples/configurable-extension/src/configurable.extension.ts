import { FeeEvm, TatumConfig, TatumSdkExtension, ITatumSdkContainer, Network, EVM_BASED_NETWORKS } from "@tatumio/tatum"

export class ConfigurableExtension extends TatumSdkExtension {
  supportedNetworks: Network[] = EVM_BASED_NETWORKS
  private readonly fee: FeeEvm
  private readonly sdkConfig: TatumConfig

  constructor(tatumSdkContainer: ITatumSdkContainer, private readonly config: { configurationValue: string }) {
    super(tatumSdkContainer)
    this.fee = this.tatumSdkContainer.get(FeeEvm)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
  }

  async sayHelloWithConfiguration(){
    const fee = await this.fee.getCurrentFee()
    console.log(`[ConfigurableExtension] Hello World`)
    console.log(`[ConfigurableExtension] Getting network from TatumSDK configuration: ${this.sdkConfig.network}`)
    console.log(`[ConfigurableExtension] Getting string from ConfigurableExtension configuration: ${this.config.configurationValue}`)
    console.log(`[ConfigurableExtension] Getting base fee for the network from TatumSDK FeeEvm module: ${fee.data.gasPrice.baseFee}`)
    console.log(`[ConfigurableExtension] Base Fee for ${this.sdkConfig.network} is ${fee.data.gasPrice.baseFee}`)
  }

  init(): Promise<void> {
    if (this.sdkConfig.network === Network.ETHEREUM || this.sdkConfig.network === Network.ETHEREUM_SEPOLIA) {
      console.log(`[ConfigurableExtension] initialised`)
      return Promise.resolve(undefined)
    }
    throw new Error(`ConfigurableExtension only supports ${Network.ETHEREUM} network`)
  }

  destroy(): Promise<void> {
    console.log(`[ConfigurableExtension] disposed`)
    return Promise.resolve(undefined)
  }
}

