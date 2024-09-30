import { EVM_BASED_NETWORKS, ITatumSdkContainer, Network, TatumSdkExtension } from '@tatumio/tatum'
import { LoadBalancer } from '@tatumio/tatum/dist/src/service/rpc/generic/LoadBalancer'
import { createWeb3Name } from '@web3-name-sdk/core'

export class SpaceIdCore extends TatumSdkExtension {
  private readonly loadBalancer: LoadBalancer

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.loadBalancer = this.tatumSdkContainer.get(LoadBalancer)
  }

  public async getAddressFrom(name: string) {
    const web3name = createWeb3Name()
    return web3name.getAddress(name, this.getSpaceIdConfig())
  }

  public async getNameFrom(address: string) {
    const web3name = createWeb3Name()
    return web3name.getDomainName({ address, ...this.getSpaceIdConfig() })
  }

  private getSpaceIdConfig() {
    return { rpcUrl: this.loadBalancer.getRpcNodeUrl() }
  }

  supportedNetworks: Network[] = EVM_BASED_NETWORKS
}
