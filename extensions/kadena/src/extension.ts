import { ChainId, IUnsignedCommand, Pact, PactReference, createClient, readKeyset } from '@kadena/client'
import { ITatumSdkContainer, Network, TatumConfig, TatumSdkExtension } from '@tatumio/tatum'

import { KadenaLoadBalancerRpc } from '@tatumio/tatum/dist/src/service/rpc/other/KadenaLoadBalancerRpc'
import {
  COIN_GAS_CAPABILITY,
  CREATE_TOKEN_ID_POLICIES,
  MARMALADE_CREATE_TOKEN_CAPABILITY,
  MARMALADE_MINT_CAPABILITY,
  NFT_AMOUNT,
  NFT_BURN_AMOUNT,
  NFT_PRECISION, NULL_BURN_ADDRESS,
} from './consts'
import { KadenaGuard, KadenaNetworkId, KadenaTransferParams } from './types'

export class KadenaUtils extends TatumSdkExtension {
  private readonly kadenaRpc: KadenaLoadBalancerRpc
  private readonly sdkConfig: TatumConfig

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
    this.kadenaRpc = this.tatumSdkContainer.get(KadenaLoadBalancerRpc)
  }

  public async mintBasicNFT(
    uri: string | PactReference,
    publicKey: string,
    chainId: ChainId,
  ): Promise<IUnsignedCommand> {
    const guard: KadenaGuard = this.getGuardFromKey(publicKey)
    const { networkId, client } = this.getTatumKadenaClient(chainId)

    const createTokenIdCommand = Pact.builder
      .execution(
        Pact.modules['marmalade-v2.ledger']['create-token-id'](
          { precision: NFT_PRECISION, uri, policies: () => CREATE_TOKEN_ID_POLICIES },
          readKeyset('guardCreateTokenId'),
        ),
      )
      .addKeyset('guardCreateTokenId', guard.keyset.pred, ...guard.keyset.keys)
      .setMeta({
        chainId: chainId,
        senderAccount: guard.account,
      })
      .setNetworkId(networkId)
      .createTransaction()

    const tokenIdResult = await client.dirtyRead(createTokenIdCommand)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tokenId = tokenIdResult.result['data']

    if (!tokenId) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new Error(`Unable to create TokenId: ${tokenIdResult.result['error']['message']}`)
    }

    return Pact.builder
      .execution(
        Pact.modules['marmalade-v2.util-v1']['mint-basic-NFT'](
          uri,
          readKeyset('myUniqueKeysetForBasicNFTMint'),
        ),
      )
      .addKeyset('myUniqueKeysetForBasicNFTMint', guard.keyset.pred, ...guard.keyset.keys)
      .addSigner(guard.keyset.keys, (signFor) => [
        signFor(COIN_GAS_CAPABILITY),
        signFor(MARMALADE_CREATE_TOKEN_CAPABILITY, tokenId, guard.keyset),
        signFor(MARMALADE_MINT_CAPABILITY, tokenId, guard.account, NFT_AMOUNT),
      ])
      .setMeta({
        chainId: chainId,
        senderAccount: guard.account,
      })
      .setNetworkId(networkId)
      .createTransaction()
  }

  public async burnNFT(id: string, publicKey: string, chainId: ChainId): Promise<IUnsignedCommand> {
    const guard: KadenaGuard = this.getGuardFromKey(publicKey)

    // Marmalade team don’t allow burning of tokens created with the non-fungible-policy,
    // this is being discussed now and if they ever decide to allow it this way of burning NFTs will be better
    /*
    return Pact.builder
      .execution(Pact.modules['marmalade-v2.ledger'].burn(id, guard.account, NFT_BURN_AMOUNT))
      .addSigner(guard.keyset.keys, (signFor) => [
        signFor(COIN_GAS_CAPABILITY),
        signFor(MARMALADE_BURN_CAPABILITY, id, guard.account, NFT_BURN_AMOUNT),
        signFor(MARMALADE_BURN_POLICY, id, guard.account, NFT_BURN_AMOUNT),
      ])
      .setMeta({
        chainId: chainId,
        senderAccount: guard.account,
      })
      .setNetworkId(this.getKadenaNetworkId())
      .createTransaction()
    */

    return Pact.builder
      .execution(
        Pact.modules['marmalade-v2.ledger']['transfer-create'](
          id,
          guard.account,
          () => '(create-principal (read-keyset "ks"))',
          readKeyset('ks'),
          NFT_BURN_AMOUNT,
        ),
      )
      .addSigner(guard.keyset.keys, (signFor) => [
        signFor(COIN_GAS_CAPABILITY),
        signFor('marmalade-v2.ledger.TRANSFER', id, guard.account, NULL_BURN_ADDRESS, NFT_BURN_AMOUNT),
        signFor(
          'marmalade-v2.guard-policy-v1.TRANSFER',
          id,
          guard.account,
          NULL_BURN_ADDRESS,
          NFT_BURN_AMOUNT,
        ),
      ])
      .addKeyset('ks', 'keys-all', ...[])
      .setMeta({
        chainId: chainId,
        senderAccount: guard.account,
      })
      .setNetworkId(this.getKadenaNetworkId())
      .createTransaction()
  }

  public async transferKadena(params: KadenaTransferParams) {
    const guard: KadenaGuard = this.getGuardFromKey(params.receiverPublicKey)

    return Pact.builder
      .execution(
        Pact.modules.coin['transfer-create'](params.senderAccount, guard.account, readKeyset(guard.account), {
          decimal: params.amount,
        }),
      )
      .addSigner(params.senderPublicKey, (withCapability) => [
        withCapability(COIN_GAS_CAPABILITY),
        withCapability('coin.TRANSFER', params.senderAccount, guard.account, {
          decimal: params.amount,
        }),
      ])
      .addKeyset(guard.account, guard.keyset.pred, ...guard.keyset.keys)
      .setMeta({
        chainId: params.chainId,
        senderAccount: params.senderAccount,
      })
      .setNetworkId(this.getKadenaNetworkId())
      .createTransaction()
  }

  private getTatumKadenaClient(chainId: ChainId) {
    const networkId = this.getKadenaNetworkId()
    const nodeUrl = this.kadenaRpc.getRpcNodeUrl()
    const host = `${nodeUrl}/chainweb/0.0/${networkId}/chain/${chainId}/pact`
    const client = createClient(host)
    return { networkId, client }
  }

  private getGuardFromKey(publicKey: string): KadenaGuard {
    return {
      account: 'k:' + publicKey,
      keyset: {
        keys: [publicKey],
        pred: 'keys-all',
      },
    }
  }

  private getKadenaNetworkId() {
    let networkId: KadenaNetworkId
    switch (this.sdkConfig.network) {
      case Network.KADENA:
        networkId = KadenaNetworkId.MAINNET
        break
      case Network.KADENA_TESTNET:
        networkId = KadenaNetworkId.TESTNET
        break
      default:
        throw new Error(`Unsupported network: ${this.sdkConfig.network}`)
    }
    return networkId
  }

  supportedNetworks: Network[] = [Network.KADENA, Network.KADENA_TESTNET]
}
