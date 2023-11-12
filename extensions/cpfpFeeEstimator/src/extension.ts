import { FeeUtxo, ITatumSdkContainer, Network, TatumSdkExtension, UtxoRpc } from '@tatumio/tatum'
import { Status } from '@tatumio/tatum/dist/src/util/error'
import BigNumber from 'bignumber.js'
import { FeeTransactionSpeed, Transaction } from './types'

export class CpfpFeeEstimator extends TatumSdkExtension {
  private readonly utxoRpc: UtxoRpc
  private readonly feeUtxo: FeeUtxo

  constructor(tatumSdkContainer: ITatumSdkContainer) {
    super(tatumSdkContainer)
    this.utxoRpc = this.tatumSdkContainer.getRpc<UtxoRpc>()
    this.feeUtxo = this.tatumSdkContainer.get(FeeUtxo)
  }

  private readonly pendingTxs: Transaction[] = []
  private readonly txCache: Record<string, Transaction> = {}

  public async estimateCPFPFee(
    txId: string,
    feeTransactionSpeed: FeeTransactionSpeed = FeeTransactionSpeed.FAST,
  ): Promise<number> {
    console.log('Analysing transaction: ', txId)

    await this.processTransaction(txId)

    let totalSize = 0
    const totalCurrentFee = new BigNumber(0)
    for (const tx of this.pendingTxs) {
      totalSize += tx.size
      totalCurrentFee.plus(tx.fee)
    }

    const currentFeeResponse = await this.feeUtxo.getCurrentFee()

    if (currentFeeResponse.status === Status.ERROR) {
      throw new Error('Failed to get current fee')
    }

    let currentFee: BigNumber

    switch (feeTransactionSpeed) {
      case FeeTransactionSpeed.SLOW:
        currentFee = new BigNumber(currentFeeResponse.data.slow)
        break
      case FeeTransactionSpeed.MEDIUM:
        currentFee = new BigNumber(currentFeeResponse.data.medium)
        break
      case FeeTransactionSpeed.FAST:
        currentFee = new BigNumber(currentFeeResponse.data.fast)
        break
    }

    const totalRequiredFee = currentFee.times(totalSize)
    const additionalFeeNeeded = totalRequiredFee.minus(totalCurrentFee)

    console.log('Pending txs count:', this.pendingTxs.length)
    console.log('Pending txs total size:', totalSize)
    console.log('Total current fee of pending transactions:', totalCurrentFee, 'satoshis')
    console.log('Current fast fee: ', currentFee.toFixed(3), 'sat/byte')
    console.log('Total fee required for CPFP to push all children:', totalRequiredFee.toFixed(0), 'satoshis')
    console.log(
      'Additional fee needed for CPFP:',
      additionalFeeNeeded.gte(0) ? additionalFeeNeeded.toFixed(0) : 0,
      'satoshis',
    )

    return additionalFeeNeeded.toNumber()
  }

  private async processTransaction(txId: string): Promise<void> {
    const transaction: Transaction = await this.tryGetFromCache(txId)

    if (transaction.confirmations) {
      return
    }

    let inputValue = new BigNumber(0)
    for (const input of transaction.vin) {
      const inputTx = await this.tryGetFromCache(input.txid)
      const inputVout = inputTx.vout[input.vout]
      inputValue = inputValue.plus(inputVout.value)
    }

    const outputValue = transaction.vout.reduce(
      (acc, curr) => acc.plus(new BigNumber(curr.value)),
      new BigNumber(0),
    )

    const fee = inputValue.minus(outputValue).multipliedBy(1e8)
    console.log('Transaction fee:', fee.toFixed(0), 'satoshis')
    console.log('Transaction fee per byte:', fee.dividedBy(transaction.size).toFixed(3), 'sat/byte')
    console.log('Adding pending tx hash:', txId)

    this.pendingTxs.push({ ...transaction, fee: fee })

    for (const { txid } of transaction.vin) {
      await this.processTransaction(txid)
    }
  }

  private async tryGetFromCache(txId: string): Promise<Transaction> {
    if (!this.txCache[txId]) {
      const txResult = await this.utxoRpc.getRawTransaction(txId, true)
      if (txResult.result) {
        this.txCache[txId] = txResult.result
      } else {
        throw new Error(`Transaction ${txId} not found`)
      }
    }

    return this.txCache[txId]
  }

  supportedNetworks: Network[] = [Network.BITCOIN, Network.BITCOIN_TESTNET]
}
