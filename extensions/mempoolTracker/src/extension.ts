import { ITatumSdkContainer, Network, TatumSdkExtension, UtxoRpc } from '@tatumio/tatum'

export class MempoolTracker extends TatumSdkExtension {
  private readonly utxoRpc: UtxoRpc
  private seenTxIds: Set<string> = new Set<string>()
  private newTxPool: string[] = []
  private timeout: NodeJS.Timeout
  private mempoolSize = 0

  constructor(
    tatumSdkContainer: ITatumSdkContainer,
    private readonly options: { intervalMs: number } = { intervalMs: 10000 },
  ) {
    super(tatumSdkContainer)
    this.utxoRpc = this.tatumSdkContainer.getRpc<UtxoRpc>()
  }

  public async getNewMempoolTransactions(): Promise<string[]> {
    const newMemPoolTransactions = this.newTxPool

    this.newTxPool = []

    return newMemPoolTransactions
  }

  public async startTracking(): Promise<void> {
    await this.fetchNewTransactions()

    this.timeout = setInterval(async () => {
      await this.fetchNewTransactions()
    }, this.options.intervalMs)
  }

  public async stopTracking(): Promise<void> {
    clearInterval(this.timeout)
  }

  public async destroy(): Promise<void> {
    await this.stopTracking()
  }

  private async fetchNewTransactions(): Promise<void> {
    const infoResponse = await this.utxoRpc.getMempoolInfo()
    if (!infoResponse.result) {
      throw new Error(`Failed to retrieve mempool info - ${infoResponse.error}`)
    }

    if (infoResponse.result.size === this.mempoolSize) {
      return
    }
    this.mempoolSize = infoResponse.result.size

    const response = await this.utxoRpc.getRawMemPool()
    if (!response.result) {
      throw new Error(`Failed to retrieve mempool transactions - ${response.error}`)
    }

    const currentTxIds = response.result as string[]

    if (this.seenTxIds.size === 0) {
      this.seenTxIds = new Set(currentTxIds)
      return
    }

    const newTxIds = currentTxIds.filter((txId) => !this.seenTxIds.has(txId))

    if (this.seenTxIds.size > currentTxIds.length * 2) {
      this.seenTxIds = new Set(currentTxIds)
    } else {
      for (const newTxId of newTxIds) {
        this.seenTxIds.add(newTxId)
      }
    }

    this.newTxPool.push(...newTxIds)
  }

  supportedNetworks: Network[] = [
    Network.BITCOIN,
    Network.BITCOIN_TESTNET,
    Network.LITECOIN,
    Network.LITECOIN_TESTNET,
    Network.DOGECOIN,
    Network.DOGECOIN_TESTNET,
  ]
}
