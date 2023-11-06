# 🌍 Mempool Tracker

Mempool Tracker integrates seamlessly with Tatum SDK to provide mempool tracking capabilities for UTXO-based blockchains.

## 📖 Description

The `MempoolTracker` serves as a specialized utility designed to monitor and keep track of new transactions entering the mempool. In the world of blockchain, the mempool represents a holding area for transactions that are waiting to be confirmed by the network. As transactions are broadcasted to the network, they are first placed in the mempool before being included in a block by miners.

Given the dynamic nature of the mempool, where transactions continuously enter and leave, it becomes essential for developers and blockchain enthusiasts to have tools that allow them to monitor this activity. This is where the `MempoolTracker` steps in.

By leveraging the capabilities of the `TatumSdkExtension`, the `MempoolTracker` periodically polls the mempool at defined intervals, capturing and storing new transaction IDs. This enables users to:

- **Real-time Monitoring**: Keep a watchful eye on the mempool's current state and understand the influx of new transactions.
- **Data Analysis**: Analyze patterns or spikes in mempool activity, which can be indicative of network congestion or other network events.
- **Custom Notifications**: Developers can build custom logic on top of the tracker, setting up notifications or alerts for specific transaction patterns or thresholds.

In essence, the `MempoolTracker` provides a streamlined mechanism for those looking to stay updated with the ever-changing landscape of the blockchain's mempool, ensuring they're always in the loop with the latest transactional activity.

## 🚀 Quick Start

1. **Installation**

   Firstly, ensure that the `@tatumio/mempool-tracker` package is set as a dependency within your project. Next, import the Mempool Tracker extension:

   ```typescript
   import { MempoolTracker } from '@tatumio/mempool-tracker';
   ```

2. **Initialization**

   Create an instance of Tatum SDK passing `MempoolTracker` as one of extensions.

   ```typescript
   const tatumSdk = await TatumSDK.init<Bitcoin>({
        network: Network.BITCOIN,
        configureExtensions: [
            MempoolTracker,
        ]
    })
   ```

## 🛠️ How to Use

1. **Start Tracking**:
   Call the `startTracking` method to begin monitoring the mempool for new transactions.

    ```typescript
    await tatumSdk.extension(MempoolTracker).startTracking()
    ```

   This method will start a periodic check (based on the defined interval) and store any new transactions found in the mempool.


2. **Retrieve New Mempool Transactions**:
   After starting the tracker, you can retrieve a list of new transactions from the mempool using the `getNewMempoolTransactions` method.

    ```typescript
    const newTransactions = await tatumSdk.extension(MempoolTracker).getNewMempoolTransactions();
    ```

   This method will return an array of transaction IDs (strings) and will reset the new transaction pool, ensuring that subsequent calls will only return newly discovered transactions.

## ⚙️️ Configuring Extension

When registering extension in `TatumSDK` instance you can pass configuration object as a second parameter:

```typescript
const tatumSdk = await TatumSDK.init<Bitcoin>({
    network: Network.BITCOIN,
    configureExtensions: [
       {type: MempoolTracker, config: {intervalMs: 5_000}},
    ]
})
```

`intervalMs` - defines the interval (in milliseconds) at which the tracker will poll the mempool for new transactions. The default value is 10 seconds.

## 🔗🔗 Supported Networks

```typescript
Network.BITCOIN,
Network.BITCOIN_TESTNET,
Network.LITECOIN,
Network.LITECOIN_TESTNET,
Network.DOGECOIN,
Network.DOGECOIN_TESTNET
```
