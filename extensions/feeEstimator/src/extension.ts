import { EvmRpc, ITatumSdkContainer, Network, TatumSdkExtension } from '@tatumio/tatum';
import { TxPayload } from "@tatumio/tatum/dist/src/dto";
import BigNumber from "bignumber.js";

export class FeeEstimator extends TatumSdkExtension {
    supportedNetworks: Network[] = [
        Network.ETHEREUM,
        Network.ETHEREUM_SEPOLIA,
        Network.ETHEREUM_HOLESKY
    ];
    private readonly ethereumRpc: EvmRpc;
    private gasPriceHistory: number[] = [];
    private congestionCoefficient = 1;
    private timeout: NodeJS.Timeout;
    private readonly EMA_SHORT_PERIOD = 12;
    private readonly EMA_LONG_PERIOD = 26;
    private readonly SMOOTHING = 2;

    constructor(
        tatumSdkContainer: ITatumSdkContainer,
        private readonly options: { intervalMs: number } = { intervalMs: 10000 },
    ) {
        super(tatumSdkContainer);
        this.ethereumRpc = this.tatumSdkContainer.getRpc<EvmRpc>();
    }

    public async startTracking(): Promise<void> {
        await this.initGasPriceHistory();
        this.timeout = setInterval(async () => {
            await this.fetchGasPrices();
        }, this.options.intervalMs);
    }

    public async stopTracking(): Promise<void> {
        clearInterval(this.timeout);
    }

    public async destroy(): Promise<void> {
        await this.stopTracking();
    }

    public async getAdjustedGasEstimate(callObject: TxPayload): Promise<BigNumber> {
        const estimatedGas = await this.ethereumRpc.estimateGas(callObject);
        if (!estimatedGas.result) {
            throw new Error('Could not estimate gas');
        }
        return estimatedGas.result.times(this.congestionCoefficient);
    }

    private async initGasPriceHistory(): Promise<void> {
        const latestBlock = await this.ethereumRpc.getBlockByNumber('latest');
        let latestBlockNumber = parseInt(latestBlock.result.number, 16);

        for (let i = 0; i < this.EMA_LONG_PERIOD; i++) {
            const block = await this.ethereumRpc.getBlockByNumber(`0x${(latestBlockNumber - i).toString(16)}`);
            if (!block.result) {
                throw new Error('Failed to retrieve block information');
            }
            const nativeCurrencyTransactions = block.result.transactions.filter((tx: { value: string; input: string; }) => tx.value !== '0x0' && tx.input === '0x');
            if (nativeCurrencyTransactions.length > 0) {
                const averageGasPrice = nativeCurrencyTransactions.reduce((acc: number, tx: { gasPrice: string; }) => acc + parseInt(tx.gasPrice, 16), 0) / nativeCurrencyTransactions.length;
                this.gasPriceHistory.unshift(averageGasPrice / 1000000000);
            }
        }

        if (this.gasPriceHistory.length > 0) {
            this.congestionCoefficient = this.calculateCongestionCoefficient();
        }
    }

    private async fetchGasPrices(): Promise<void> {
        const block = await this.ethereumRpc.getBlockByNumber('latest');
        const nativeCurrencyTransactions = block.result.transactions.filter((tx: { value: string; input: string; }) => tx.value !== '0x0' && tx.input === '0x');
        const averageGasPrice = nativeCurrencyTransactions.reduce((acc: number, tx: { gasPrice: string; }) => acc + parseInt(tx.gasPrice, 16), 0) / nativeCurrencyTransactions.length;

        this.gasPriceHistory.push(averageGasPrice / 1000000000);

        if (this.gasPriceHistory.length >= this.EMA_LONG_PERIOD) {
            this.congestionCoefficient = this.calculateCongestionCoefficient();
        }
    }

    private calculateCongestionCoefficient(): number {
        const emaShort = this.calculateEMA(this.gasPriceHistory.slice(-this.EMA_SHORT_PERIOD), this.EMA_SHORT_PERIOD);
        const emaLong = this.calculateEMA(this.gasPriceHistory.slice(-this.EMA_LONG_PERIOD), this.EMA_LONG_PERIOD);
        return emaShort[emaShort.length - 1] / emaLong[emaLong.length - 1];
    }

    private calculateEMA(prices: number[], period: number): number[] {
        let ema: number[] = [];
        let k = this.SMOOTHING / (1 + period);
        ema.push(prices[0]);

        for (let i = 1; i < prices.length; i++) {
            ema.push(prices[i] * k + ema[i - 1] * (1 - k));
        }

        return ema;
    }
}
