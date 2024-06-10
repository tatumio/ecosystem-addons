import { ITatumSdkContainer, Network, TatumConfig, TatumSdkExtension } from '@tatumio/tatum'
import {
  ChainId,
  createClient,
  IUnsignedCommand,
  Pact,
  PactReference,
  readKeyset
} from "@kadena/client";

import { KadenaGuard, KadenaNetworkId } from "./types";
import {
  COIN_GAS_CAPABILITY,
  CREATE_TOKEN_ID_POLICIES,
  NFT_PRECISION,
  MARMALADE_CREATE_TOKEN_CAPABILITY,
  MARMALADE_MINT_CAPABILITY,
  NFT_AMOUNT,
  MARMALADE_BURN_CAPABILITY,
  NFT_BURN_AMOUNT,
  MARMALADE_BURN_POLICY
} from "./consts";
import { KadenaLoadBalancerRpc } from "@tatumio/tatum/dist/src/service/rpc/other/KadenaLoadBalancerRpc";

export class KadenaUtils extends TatumSdkExtension {
  private readonly kadenaRpc: KadenaLoadBalancerRpc
  private readonly sdkConfig: TatumConfig

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.sdkConfig = this.tatumSdkContainer.getConfig()
    this.kadenaRpc = this.tatumSdkContainer.get(KadenaLoadBalancerRpc)
  }

  public async mintBasicNFT(uri: string | PactReference, publicKey: string, chainId: ChainId) : Promise<IUnsignedCommand> {

    const guard : KadenaGuard = this.getGuardFromKey(publicKey)
    const {networkId, client} = this.getTatumKadenaClient(chainId);

    const createTokenIdCommand = Pact.builder
      .execution(
        Pact.modules['marmalade-v2.ledger']['create-token-id'](
          {precision: NFT_PRECISION, uri, policies: () => CREATE_TOKEN_ID_POLICIES},
          readKeyset('guardCreateTokenId')
        )
      )
      .addKeyset('guardCreateTokenId', guard.keyset.pred, ...guard.keyset.keys)
      .setMeta({
        chainId: chainId,
        senderAccount: guard.account,
      })
      .setNetworkId(networkId)
      .createTransaction();

    const tokenIdResult = await client.dirtyRead(createTokenIdCommand);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tokenId = tokenIdResult.result['data'];

    if(!tokenId) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new Error(`Unable to create TokenId: ${tokenIdResult.result['error']['message']}`);
    }

    return Pact.builder
      .execution(
        Pact.modules['marmalade-v2.util-v1']['mint-basic-NFT'](
          uri,
          readKeyset('myUniqueKeysetForBasicNFTMint')
        )
      )
      .addKeyset('myUniqueKeysetForBasicNFTMint', guard.keyset.pred, ...guard.keyset.keys)
      .addSigner(guard.keyset.keys, (signFor) => [
        signFor(COIN_GAS_CAPABILITY),
        signFor(MARMALADE_CREATE_TOKEN_CAPABILITY, tokenId, guard.keyset),
        signFor(MARMALADE_MINT_CAPABILITY, tokenId, guard.account, NFT_AMOUNT )
      ])
      .setMeta({
        chainId: chainId,
        senderAccount: guard.account,
      })
      .setNetworkId(networkId)
      .createTransaction();
  }

  private getTatumKadenaClient(chainId: ChainId) {
    const networkId = this.getKadenaNetworkId();
    const nodeUrl = this.kadenaRpc.getRpcNodeUrl()
    const host = `${nodeUrl}/chainweb/0.0/${networkId}/chain/${chainId}/pact`
    console.log(`host: ${host}`)
    const client = createClient(host);
    return {networkId, client};
  }

  public async burnNFT(id: string, publicKey: string, chainId: ChainId) : Promise<IUnsignedCommand> {
    const networkId = this.getKadenaNetworkId();
    const guard : KadenaGuard = this.getGuardFromKey(publicKey)

    return Pact.builder
      .execution(
        Pact.modules['marmalade-v2.ledger'].burn(id, guard.account, NFT_BURN_AMOUNT)
      )
      .addSigner(guard.keyset.keys, (signFor) => [
        signFor(COIN_GAS_CAPABILITY),
        signFor(MARMALADE_BURN_CAPABILITY, id, guard.account, NFT_BURN_AMOUNT ),
        signFor(MARMALADE_BURN_POLICY, id, guard.account, NFT_BURN_AMOUNT)
      ])
      .setMeta({
        chainId: chainId,
        senderAccount: guard.account,
      })
      .setNetworkId(networkId)
      .createTransaction();
  }

  private getGuardFromKey(publicKey: string) : KadenaGuard {
    return {
      account: 'k:' + publicKey,
      keyset: {
        keys: [publicKey],
        pred: 'keys-all'
      }
    };
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
    return networkId;
  }

  supportedNetworks: Network[] = [
    Network.KADENA,
    Network.KADENA_TESTNET,
  ]
}
