import { FeeUtxo, ITatumSdkContainer, Network, TatumSdkExtension, UtxoRpc } from '@tatumio/tatum'
import { Status } from '@tatumio/tatum/dist/src/util/error'
import BigNumber from 'bignumber.js'
import { CPFPFeeEstimation, FeeTransactionSpeed, Transaction } from './types'

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
  ): Promise<CPFPFeeEstimation> {
    await this.processTransaction(txId)

    let totalSize = 0
    let totalCurrentFee = new BigNumber(0)
    for (const tx of this.pendingTxs) {
      totalSize += tx.size
      totalCurrentFee = totalCurrentFee.plus(tx.fee)
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

    return {
      transactionsInChain: this.pendingTxs,
      totalSizeBytes: totalSize,
      totalCurrentFee: totalCurrentFee.toFixed(0),
      targetTransactionSpeed: feeTransactionSpeed,
      targetFeePerByte: currentFee.toFixed(3),
      totalRequiredFee: totalRequiredFee.toFixed(0),
      additionalFeeNeeded: additionalFeeNeeded.gte(0) ? additionalFeeNeeded.toFixed(0) : '0',
    }
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

    const outputValue = transaction.vout.reduce((acc, curr) => acc.plus(curr.value), new BigNumber(0))

    const fee = inputValue.minus(outputValue)

    this.pendingTxs.push({ ...transaction, fee: fee, feePerByte: fee.dividedBy(transaction.size) })

    for (const { txid } of transaction.vin) {
      await this.processTransaction(txid)
    }
  }

  private async tryGetFromCache(txId: string): Promise<Transaction> {
    if (!this.txCache[txId]) {
      const txResult = await this.utxoRpc.getRawTransaction(txId, true)
      if (txResult.result) {
        this.txCache[txId] = {
          txid: txResult.result.txid,
          size: txResult.result.size,
          fee: new BigNumber(0),
          feePerByte: new BigNumber(0),
          vin: txResult.result.vin.map((vin: { txid: string; vout: number }) => ({
            txid: vin.txid,
            vout: vin.vout,
          })),
          confirmations: txResult.result.confirmations,
          vout: txResult.result.vout.map((vout: { value: number; scriptPubKey: { address: string } }) => ({
            value: new BigNumber(vout.value).multipliedBy(1e8),
            address: vout.scriptPubKey.address,
          })),
        }
      } else {
        throw new Error(`Transaction ${txId} not found`)
      }
    }

    return this.txCache[txId]
  }

  supportedNetworks: Network[] = [Network.BITCOIN, Network.BITCOIN_TESTNET]
}
