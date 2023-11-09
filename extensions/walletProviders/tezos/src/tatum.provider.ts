import {
  AllTicketBalances,
  BakingRightsQueryArguments,
  BakingRightsResponse,
  BalanceResponse,
  BallotListResponse,
  BallotsResponse,
  BigMapGetResponse,
  BigMapKey,
  BigMapResponse,
  BlockHeaderResponse,
  BlockMetadata,
  BlockResponse,
  ConstantsResponse,
  ContractResponse,
  CurrentProposalResponse,
  CurrentQuorumResponse,
  DelegateResponse,
  DelegatesResponse,
  EndorsingRightsQueryArguments,
  EndorsingRightsResponse,
  EntrypointsResponse,
  ForgeOperationsParams,
  ManagerKeyResponse,
  OperationHash,
  OriginationProofParams,
  PackDataParams,
  PendingOperations,
  PendingOperationsQueryArguments,
  PreapplyParams,
  PreapplyResponse,
  ProposalsResponse,
  ProtocolsResponse,
  RPCOptions,
  RPCRunCodeParam,
  RPCRunOperationParam,
  RPCRunScriptViewParam,
  RPCRunViewParam,
  RPCSimulateOperationParam,
  RpcClientInterface,
  RunCodeResult,
  RunScriptViewResult,
  RunViewResult,
  SaplingDiffResponse,
  ScriptResponse,
  StorageResponse,
  TicketTokenParams,
  TxRollupInboxResponse,
  TxRollupStateResponse,
  UnparsingMode,
  VotesListingsResponse,
  VotingInfoResponse,
  VotingPeriodBlockResult,
} from '@taquito/rpc'
import { InvalidAddressError, ValidationResult, invalidDetail, validateAddress } from '@taquito/utils'
import {
  InjectOperation,
  PreapplyOperations,
  SimulateOperation,
  TezosRpcInterface,
} from '@tatumio/tatum/dist/src/dto/rpc/TezosRpcSuite'
import BigNumber from 'bignumber.js'
import { castToBigNumber } from './utils'

const defaultRPCOptions: RPCOptions = { block: 'head' }

export class TatumProvider implements RpcClientInterface {
  constructor(private readonly rpc: TezosRpcInterface, private readonly chain: string) {}

  async getBalance(address: string, { block }: RPCOptions = defaultRPCOptions): Promise<BalanceResponse> {
    this.validateAddress(address)
    const result = await this.rpc.getContractBalance({ contractId: address, block, chainId: this.chain })

    return new BigNumber(result)
  }

  getChainId(): Promise<string> {
    return this.rpc.getChainId({ chainId: this.chain })
  }

  async getConstants({ block }: RPCOptions = defaultRPCOptions): Promise<ConstantsResponse> {
    const response = await this.rpc.getConstants({ block, chainId: this.chain })

    const castedResponse: ConstantsResponse = castToBigNumber(response, [
      'time_between_blocks',
      'hard_gas_limit_per_operation',
      'hard_gas_limit_per_block',
      'proof_of_work_threshold',
      'tokens_per_roll',
      'seed_nonce_revelation_tip',
      'block_security_deposit',
      'endorsement_security_deposit',
      'block_reward',
      'endorsement_reward',
      'cost_per_byte',
      'hard_storage_limit_per_operation',
      'test_chain_duration',
      'baking_reward_per_endorsement',
      'delay_per_missing_endorsement',
      'minimal_block_delay',
      'liquidity_baking_subsidy',
      'cache_layout',
      'baking_reward_fixed_portion',
      'baking_reward_bonus_per_slot',
      'endorsing_reward_per_slot',
      'double_baking_punishment',
      'delay_increment_per_round',
      'tx_rollup_commitment_bond',
      'vdf_difficulty',
      'sc_rollup_stake_amount',
      'minimal_stake',
    ])

    return {
      ...response,
      ...castedResponse,
    }
  }

  async getContract(address: string, { block }: RPCOptions = defaultRPCOptions): Promise<ContractResponse> {
    this.validateAddress(address)
    const contractResponse = await this.rpc.getContract({ contractId: address, block, chainId: this.chain })
    return {
      ...contractResponse,
      balance: new BigNumber(contractResponse.balance),
    }
  }

  getBlockHeader({ block }: RPCOptions = defaultRPCOptions): Promise<BlockHeaderResponse> {
    return this.rpc.getBlockHeader({ block: block, chainId: this.chain })
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async getManagerKey(address: string, options?: RPCOptions): Promise<ManagerKeyResponse> {
    return 'dummy'
  }

  simulateOperation(
    op: RPCSimulateOperationParam,
    { block }: RPCOptions = defaultRPCOptions,
  ): Promise<PreapplyResponse> {
    const simulateOperation: SimulateOperation = {
      ...op,
      block,
      chainId: this.chain,
    }

    return this.rpc.simulateOperation(simulateOperation)
  }

  preapplyOperations(
    ops: PreapplyParams,
    { block }: RPCOptions = defaultRPCOptions,
  ): Promise<PreapplyResponse[]> {
    const preapplyOperations: PreapplyOperations = {
      operations: ops,
      block,
      chainId: this.chain,
    }

    return this.rpc.preapplyOperations(preapplyOperations)
  }

  injectOperation(signedOpBytes: string): Promise<OperationHash> {
    const injectOperation: InjectOperation = {
      operationBytes: signedOpBytes,
    }

    return this.rpc.injectOperation(injectOperation)
  }

  getProtocols({ block }: RPCOptions = defaultRPCOptions): Promise<ProtocolsResponse> {
    return this.rpc.getProtocols({ block, chainId: this.chain })
  }

  forgeOperations(data: ForgeOperationsParams, options?: RPCOptions): Promise<string> {
    throw new Error(`Method not implemented. Params: ${data}, ${options}`)
  }

  getAllTicketBalances(contract: string, options?: RPCOptions): Promise<AllTicketBalances> {
    throw new Error(`Method not implemented. Params: ${contract}, ${options}`)
  }

  getBakingRights(args: BakingRightsQueryArguments, options?: RPCOptions): Promise<BakingRightsResponse> {
    throw new Error(`Method not implemented. Params: ${args}, ${options}`)
  }

  getBallotList(options?: RPCOptions): Promise<BallotListResponse> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getBallots(options?: RPCOptions): Promise<BallotsResponse> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getBigMapExpr(id: string, expr: string, options?: RPCOptions): Promise<BigMapResponse> {
    throw new Error(`Method not implemented. Params: ${id}, ${expr}, ${options}`)
  }

  getBigMapKey(address: string, key: BigMapKey, options?: RPCOptions): Promise<BigMapGetResponse> {
    throw new Error(`Method not implemented. Params: ${address}, ${key}, ${options}`)
  }

  getBlock(options?: RPCOptions): Promise<BlockResponse> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getBlockHash(options?: RPCOptions): Promise<string> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getBlockMetadata(options?: RPCOptions): Promise<BlockMetadata> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getCurrentPeriod(options?: RPCOptions): Promise<VotingPeriodBlockResult> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getCurrentProposal(options?: RPCOptions): Promise<CurrentProposalResponse> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getCurrentQuorum(options?: RPCOptions): Promise<CurrentQuorumResponse> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getDelegate(address: string, options?: RPCOptions): Promise<DelegateResponse> {
    throw new Error(`Method not implemented. Params: ${address}, ${options}`)
  }

  getDelegates(address: string, options?: RPCOptions): Promise<DelegatesResponse> {
    throw new Error(`Method not implemented. Params: ${address}, ${options}`)
  }

  getEndorsingRights(
    args: EndorsingRightsQueryArguments,
    options?: RPCOptions,
  ): Promise<EndorsingRightsResponse> {
    throw new Error(`Method not implemented. Params: ${args}, ${options}`)
  }

  getEntrypoints(contract: string, options?: RPCOptions): Promise<EntrypointsResponse> {
    throw new Error(`Method not implemented. Params: ${contract}, ${options}`)
  }

  getLiveBlocks(options?: RPCOptions): Promise<string[]> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getNormalizedScript(
    address: string,
    unparsingMode?: UnparsingMode,
    options?: RPCOptions,
  ): Promise<ScriptResponse> {
    throw new Error(`Method not implemented. Params: ${address}, ${unparsingMode}, ${options}`)
  }

  getOriginationProof(params: OriginationProofParams, options?: RPCOptions): Promise<string> {
    throw new Error(`Method not implemented. Params: ${params}, ${options}`)
  }

  getPendingOperations(args: PendingOperationsQueryArguments): Promise<PendingOperations> {
    throw new Error(`Method not implemented. Params: ${args}`)
  }

  getProposals(options?: RPCOptions): Promise<ProposalsResponse> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getRpcUrl(): string {
    throw new Error(`Method not implemented. Params: `)
  }

  getSaplingDiffByContract(contract: string, options?: RPCOptions): Promise<SaplingDiffResponse> {
    throw new Error(`Method not implemented. Params: ${contract}, ${options}`)
  }

  getSaplingDiffById(id: string, options?: RPCOptions): Promise<SaplingDiffResponse> {
    throw new Error(`Method not implemented. Params: ${id}, ${options}`)
  }

  getScript(address: string, options?: RPCOptions): Promise<ScriptResponse> {
    throw new Error(`Method not implemented. Params: ${address}, ${options}`)
  }

  getStorage(address: string, options?: RPCOptions): Promise<StorageResponse> {
    throw new Error(`Method not implemented. Params: ${address}, ${options}`)
  }

  getStoragePaidSpace(contract: string, options?: RPCOptions): Promise<string> {
    throw new Error(`Method not implemented. Params: ${contract}, ${options}`)
  }

  getStorageUsedSpace(contract: string, options?: RPCOptions): Promise<string> {
    throw new Error(`Method not implemented. Params: ${contract}, ${options}`)
  }

  getSuccessorPeriod(options?: RPCOptions): Promise<VotingPeriodBlockResult> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getTicketBalance(contract: string, ticket: TicketTokenParams, options?: RPCOptions): Promise<string> {
    throw new Error(`Method not implemented. Params: ${contract}, ${ticket}, ${options}`)
  }

  getTxRollupInbox(
    txRollupId: string,
    blockLevel: string,
    options?: RPCOptions,
  ): Promise<TxRollupInboxResponse | null> {
    throw new Error(`Method not implemented. Params: ${txRollupId}, ${blockLevel}, ${options}`)
  }

  getTxRollupState(txRollupId: string, options?: RPCOptions): Promise<TxRollupStateResponse> {
    throw new Error(`Method not implemented. Params: ${txRollupId}, ${options}`)
  }

  getVotesListings(options?: RPCOptions): Promise<VotesListingsResponse> {
    throw new Error(`Method not implemented. Params: ${options}`)
  }

  getVotingInfo(address: string, options?: RPCOptions): Promise<VotingInfoResponse> {
    throw new Error(`Method not implemented. Params: ${address}, ${options}`)
  }

  packData(
    data: PackDataParams,
    options?: RPCOptions,
  ): Promise<{ packed: string; gas: BigNumber | 'unaccounted' | undefined }> {
    throw new Error(`Method not implemented. Params: ${data}, ${options}`)
  }

  runCode(code: RPCRunCodeParam, options?: RPCOptions): Promise<RunCodeResult> {
    throw new Error(`Method not implemented. Params: ${code}, ${options}`)
  }

  runOperation(op: RPCRunOperationParam, options?: RPCOptions): Promise<PreapplyResponse> {
    throw new Error(`Method not implemented. Params: ${op}, ${options}`)
  }

  runScriptView(viewScriptParams: RPCRunScriptViewParam, options?: RPCOptions): Promise<RunScriptViewResult> {
    throw new Error(`Method not implemented. Params: ${viewScriptParams}, ${options}`)
  }

  runView(viewParams: RPCRunViewParam, options?: RPCOptions): Promise<RunViewResult> {
    throw new Error(`Method not implemented. Params: ${viewParams}, ${options}`)
  }

  private validateAddress(address: string) {
    const addressValidation = validateAddress(address)
    if (addressValidation !== ValidationResult.VALID) {
      throw new InvalidAddressError(address, invalidDetail(addressValidation))
    }
  }
}
