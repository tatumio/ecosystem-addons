import { ITatumSdkContainer, Network, TatumSdkExtension } from '@tatumio/tatum'
import { LoadBalancer } from '@tatumio/tatum/dist/src/service/rpc/generic/LoadBalancer'

import { TEST } from './consts'
import { Test } from './types'

export class SpaceIdCore extends TatumSdkExtension {
  private readonly loadBalancer: LoadBalancer

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.loadBalancer = this.tatumSdkContainer.get(LoadBalancer)
  }

  public test(): Test {
    console.log(this.getRpcUrl())
    return { test: TEST }
  }

  private getRpcUrl() {
    return this.loadBalancer.getRpcNodeUrl()
  }

  supportedNetworks: Network[] = [Network.ETHEREUM]
}
