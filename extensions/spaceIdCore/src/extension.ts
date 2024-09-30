import { ITatumSdkContainer, Network, TatumConfig, TatumSdkExtension } from '@tatumio/tatum'

import { TEST } from './consts'
import { Test } from './types'

export class SpaceIdCore extends TatumSdkExtension {
  private readonly sdkConfig: TatumConfig

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
  }

  public test(): Test {
    console.log(this.sdkConfig)
    return { test: TEST }
  }

  supportedNetworks: Network[] = [Network.ETHEREUM]
}
