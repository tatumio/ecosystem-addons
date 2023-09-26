import { FeeEvm, Network, TatumConfig, ITatumSdkContainer, TatumSdkExtension } from "@tatumio/tatum"

export class HelloWorldExtension extends TatumSdkExtension {
  private readonly fee: FeeEvm
  private readonly sdkConfig: TatumConfig

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.fee = this.tatumSdkContainer.get(FeeEvm)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
  }

  async sayHello(){
    const fee = await this.fee.getCurrentFee()
    console.log(`[HelloWorldExtension] Hello World`)
    console.log(`[HelloWorldExtension] Getting network from TatumSDK configuration: ${this.sdkConfig.network}`)
    console.log(`[HelloWorldExtension] Getting base fee for the network from TatumSDK FeeEvm module: ${fee.data.gasPrice.baseFee}`)
    console.log(`[HelloWorldExtension] Base Fee for ${this.sdkConfig.network} is ${fee.data.gasPrice.baseFee}`)
  }

  init(): Promise<void> {
    if (this.sdkConfig.network === Network.ETHEREUM || this.sdkConfig.network === Network.ETHEREUM_SEPOLIA) {
      console.log(`[HelloWorldExtension] initialised`)
      return Promise.resolve(undefined)
    }
    throw new Error(`HelloWorldExtension only supports ${Network.ETHEREUM} network`)
  }

  destroy(): void {
    console.log(`[HelloWorldExtension] disposed`)
  }
}

