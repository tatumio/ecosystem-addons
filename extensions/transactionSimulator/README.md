# 🌍 Transaction Simulator

Transaction Simulator integrates seamlessly with Tatum SDK to provide transaction simulation capabilities for EVM-based blockchains.

## 📖 Description

The Transaction Simulator is designed to bolster the efficiency and security of blockchain transactions. It offers crucial capabilities such as:

- Simulating native currency transfers.
- Simulating ERC20 token transfers.

By leveraging these simulations, developers can:

1. **Estimate Fees Accurately:** One of the primary challenges in sending blockchain transactions is determining an optimal gas fee that ensures quick confirmation without overpaying. By simulating a transaction before sending it, developers can get a precise estimate of the gas fee, saving costs and improving user experience.

2. **Enhance Safety:** Simulating transactions allows developers to anticipate and catch potential errors or vulnerabilities in transaction logic. By identifying these issues in a simulation environment, developers can prevent costly mistakes when deploying actual transactions.

3. **Optimize Transaction Parameters:** Beyond just estimating fees, simulating transactions can help developers fine-tune other parameters, such as gas limit or nonce, to optimize transaction performance.

It is built upon popular packages like `ethers`, ensuring a robust, reliable, and secure foundation for all simulation activities.

## 🚀 Quick Start

1. **Installation**

   Firstly, ensure that the `@tatumio/transaction-simulator` package is set as a dependency within your project. Next, import the Transaction Simulator extension:

   ```typescript
   import { TransactionSimulator } from '@tatumio/transaction-simulator';
   ```

2. **Initialization**

   Create an instance of Tatum SDK passing `TransactionSimulator` as one of extensions.

   ```typescript
   const tatumSdk = await TatumSDK.init<Ethereum>({
        network: Network.ETHEREUM,
        configureExtensions: [
            TransactionSimulator,
        ]
    })
   ```

## 🛠️ How to Use

The Transaction Simulator provides methods to simulate native and ERC20 token transfers on EVM-based blockchains. Below is a guide on how to utilize these functionalities:

### Native Transfers:

1. **Define Your Payload**:
   Begin by creating a `Transfer` object. This object will encapsulate all the required parameters for your native transaction.

    ```typescript
    const transferPayload: Transfer = {
      to: 'recipient_address',
      from: 'sender_address',
      value: 1000, // example amount to send in wei
    };
    ```

2. **Call `simulateTransfer`**:
   Pass the defined payload to the `simulateTransfer` method.

    ```typescript
    const simulationResult = await simulateTransfer(transferPayload);
    ```

   This method simulates the transaction, estimates the fees, and returns the expected result of the transaction.

### ERC20 Token Transfers:

1. **Define Your Token Transfer Payload**:
   To simulate an ERC20 token transfer, you will use the `TokenTransfer` object.

    ```typescript
    const tokenTransferPayload: TokenTransfer = {
      to: 'recipient_address',
      from: 'sender_address',
      value: 500, // example token amount to send
      tokenContractAddress: 'your_erc20_token_contract_address'
    };
    ```

2. **Call `simulateTransferErc20`**:
   With your `TokenTransfer` payload ready, pass it to the `simulateTransferErc20` method.

    ```typescript
    const tokenSimulationResult = await simulateTransferErc20(tokenTransferPayload);
    ```

   This method fetches token details, simulates the transaction, and returns an estimation of the transaction's outcome along with the necessary gas fees.

By using the above methods, you can efficiently predict the behavior and costs of your transactions before actually broadcasting them, ensuring optimized and error-free transactions.

## 🔗🔗 Supported Networks

```typescript
Network.ETHEREUM,
Network.ETHEREUM_SEPOLIA,
Network.ETHEREUM_CLASSIC,
Network.ETHEREUM_GOERLI,
Network.ETHEREUM_HOLESKY,
Network.AVALANCHE_C,
Network.AVALANCHE_C_TESTNET,
Network.POLYGON,
Network.POLYGON_MUMBAI,
Network.GNOSIS,
Network.GNOSIS_TESTNET,
Network.FANTOM,
Network.FANTOM_TESTNET,
Network.AURORA,
Network.AURORA_TESTNET,
Network.CELO,
Network.CELO_ALFAJORES,
Network.BINANCE_SMART_CHAIN_TESTNET,
Network.VECHAIN,
Network.VECHAIN_TESTNET,
Network.XDC,
Network.XDC_TESTNET,
Network.PALM,
Network.PALM_TESTNET,
Network.CRONOS,
Network.CRONOS_TESTNET,
Network.KUCOIN,
Network.KUCOIN_TESTNET,
Network.OASIS,
Network.OASIS_TESTNET,
Network.OPTIMISM,
Network.OPTIMISM_TESTNET,
Network.HARMONY_ONE_SHARD_0,
Network.HARMONY_ONE_TESTNET_SHARD_0,
Network.KLAYTN,
Network.KLAYTN_BAOBAB,
Network.FLARE_COSTON,
Network.FLARE_COSTON_2,
Network.FLARE,
Network.FLARE_SONGBIRD,
Network.HAQQ,
Network.HAQQ_TESTNET,
Network.ARBITRUM_NOVA,
Network.ARBITRUM_NOVA_TESTNET,
Network.ARBITRUM_ONE,
Network.BINANCE_SMART_CHAIN,
Network.HORIZEN_EON,
Network.HORIZEN_EON_GOBI,
Network.CHILIZ
```
