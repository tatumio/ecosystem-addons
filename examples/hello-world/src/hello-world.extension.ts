import { FeeEvm, TatumConfig, TatumSdkExtension, TatumSdkContainer } from "@tatumio/tatum";

export class HelloWorldExtension extends TatumSdkExtension {
  private readonly fee: FeeEvm
  private readonly sdkConfig: TatumConfig

  constructor(tatumSdkContainer: TatumSdkContainer) {
    super(tatumSdkContainer)
    this.fee = this.tatumSdkContainer.get(FeeEvm)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
  }

  async sayHello(){
    const fee = await this.fee.getCurrentFee()
    console.log(`Hello World`)
    console.log(`Getting network from TatumSDK configuration: ${this.sdkConfig.network}`)
    console.log(`Getting base fee for the network from TatumSDK FeeEvm module: ${fee.data.gasPrice.baseFee}`)
    console.log(`Base Fee for ${this.sdkConfig.network} is ${fee.data.gasPrice.baseFee}`)
  }

  init(): Promise<void> {
    console.log(`HelloWorldExtension initialised`)
    return Promise.resolve(undefined);
  }

  destroy(): void {
    console.log(`HelloWorldExtension disposed`)
  }
}

