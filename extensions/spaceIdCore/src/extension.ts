import {
  EVM_BASED_NETWORKS,
  isSolanaNetwork,
  ITatumSdkContainer,
  Network,
  SOLANA_NETWORKS,
  TatumConfig,
  TatumSdkExtension,
} from '@tatumio/tatum'
import { LoadBalancer } from '@tatumio/tatum/dist/src/service/rpc/generic/LoadBalancer'
import { NetworkUtils } from '@tatumio/tatum/dist/src/util/network.utils'

import { createWeb3Name } from '@web3-name-sdk/core'
import { createSolName } from '@web3-name-sdk/core/solName'
import SIDRegister, { SupportedChainId } from '@web3-name-sdk/register'
import { ethers } from 'ethers'

import { CommonOptionalProps, GetAddressOptionalProps, GetDomainNameOptionalProps } from './types'

export class SpaceIdCore extends TatumSdkExtension {
  private readonly loadBalancer: LoadBalancer
  private readonly sdkConfig: TatumConfig

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.loadBalancer = this.tatumSdkContainer.get(LoadBalancer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
  }

  public async getAddress(name: string, optional?: GetAddressOptionalProps) {
    if (isSolanaNetwork(this.sdkConfig.network)) {
      return createSolName().getAddress({ name })
    }
    return createWeb3Name().getAddress(name, optional)
  }

  public async getDomainName(address: string, optional?: GetDomainNameOptionalProps) {
    if (isSolanaNetwork(this.sdkConfig.network)) {
      return createSolName().getDomainName({ address })
    }
    return createWeb3Name().getDomainName({ address, ...optional })
  }

  public async getDomainNames(address: string, optional?: GetDomainNameOptionalProps) {
    this.validateIfNotSolana()
    return createWeb3Name().getDomainNames({ address, ...optional })
  }

  public async getDomainNameBatch(addresses: string[], optional?: GetDomainNameOptionalProps) {
    this.validateIfNotSolana()
    return createWeb3Name().batchGetDomainName({ addressList: addresses, ...optional })
  }

  public async getDomainRecord(name: string, key: string, optional?: CommonOptionalProps) {
    this.validateIfNotSolana()
    return createWeb3Name().getDomainRecord({ name, key, ...optional })
  }

  public async getMetadata(name: string, optional?: CommonOptionalProps) {
    this.validateIfNotSolana()
    return createWeb3Name().getMetadata({ name, ...optional })
  }

  public async getContentHash(name: string, optional?: CommonOptionalProps) {
    this.validateIfNotSolana()
    return createWeb3Name().getContentHash({ name, ...optional })
  }

  public async isDomainAvailable(name: string, privateKey: string) {
    const { client } = await this.getRegisterClient(privateKey)
    return client.getAvailable(name)
  }

  public async getRegistrationFee(name: string, years: number, privateKey: string) {
    const { client } = await this.getRegisterClient(privateKey)
    return client.getRentPrice(name, years)
  }

  public async registerDomain(name: string, years: number, privateKey: string) {
    const { client, address } = await this.getRegisterClient(privateKey)

    if (await client.getAvailable(name)) {
      const price = await client.getRentPrice(name, years)

      await client.register(
        name,
        address,
        years,
        this.sdkConfig.network === Network.ETHEREUM
          ? {
              onCommitSuccess: (waitTime) => {
                return new Promise((resolve) => {
                  setTimeout(resolve, waitTime * 1000)
                })
              },
            }
          : undefined,
      )

      console.log(`[SpaceIdCore] Registered domain ${name} for ${price}`)
      return true
    }
    console.error(`[SpaceIdCore] Domain ${name} is unavailable`)
    return false
  }

  private validateIfNotSolana() {
    if (isSolanaNetwork(this.sdkConfig.network)) {
      throw new Error(`[SpaceIdCore] Method not supported for selected chain`)
    }
  }

  private getApiKey() {
    if (this.sdkConfig.apiKey && typeof this.sdkConfig.apiKey !== 'string') {
      return this.sdkConfig.apiKey.v4 || this.sdkConfig.apiKey.v3 || ''
    }
    return this.sdkConfig.apiKey || ''
  }

  private async getRegisterClient(privateKey: string) {
    const supportedChainIds: SupportedChainId[] = [1, 56, 42161, 97, 421613]
    const chainId = NetworkUtils.getChainId(this.sdkConfig.network) as SupportedChainId

    if (!supportedChainIds.includes(chainId)) {
      throw new Error(`[SpaceIdCore] Domain registration not supported for selected chain`)
    }

    const provider = new ethers.providers.JsonRpcProvider(
      { url: this.loadBalancer.getRpcNodeUrl(), headers: { 'x-api-key': this.getApiKey() } },
      chainId,
    )
    const signer = new ethers.Wallet(privateKey, provider)
    return { client: new SIDRegister({ signer, chainId }), address: await signer.getAddress() }
  }

  supportedNetworks: Network[] = [...EVM_BASED_NETWORKS, ...SOLANA_NETWORKS]
}
