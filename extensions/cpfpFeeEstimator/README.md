# 🌐 CPFP Fee Estimator

The CPFP Fee Estimator is a powerful extension of the Tatum SDK, designed specifically to provide accurate fee estimation for Child Pays for Parent (CPFP) transactions on Bitcoin and Bitcoin Testnet networks.

If your transaction is stuck due to low fees, the CPFP Fee Estimator can help you estimate the additional fee required to expedite its confirmation no matter the length of the chain of pending transactions.

## 📖 Description

The CPFP Fee Estimator enhances the efficiency and reliability of Bitcoin transactions. It is particularly useful in scenarios where unconfirmed transactions are stuck due to low fees. Key features include:

- Estimating fees for CPFP transactions.
- Processing multiple pending transactions for fee calculation.

This extension is built on top of the robust and secure infrastructure provided by the Tatum SDK, ensuring reliability and ease of integration.

## 🚀 Quick Start

1. **Installation**

   Ensure that `@tatumio/tatum` and `@tatumio/cpfp-fee-estimator` are installed in your project. Then, import the `CpfpFeeEstimator` extension:

   ```typescript
   import { CpfpFeeEstimator } from '@tatumio/cpfp-fee-estimator';
   ```

2. **Initialization**

   Create an instance of the Tatum SDK and integrate the `CpfpFeeEstimator`:

   ```typescript
   const tatumSdk = TatumSDK.init<Bitcoin>({
        network: Network.BITCOIN,
        configureExtensions: [CpfpFeeEstimator],
        version: ApiVersion.V3,
   });
   ```

## 🛠️ How to Use

To estimate the additional fee required for a CPFP transaction:

   **Estimate the CPFP Fee**:

   Call the `estimateCPFPFee` method with the transaction ID of the unconfirmed parent transaction:

```typescript
    const additionalFee = await tatumSdk.extension(CpfpFeeEstimator).estimateCPFPFee('parent-transaction-id');
    console.log(`Additional Fee Required: ${additionalFee} satoshis`);
```

   This method processes the parent transaction and its descendants to calculate the total additional fee required to expedite their confirmations.
   Note that the additional fee required should be increased by the fee of the transaction spending the outputs.

   **Return Type**:
```typescript
export interface CPFPFeeEstimation {
  transactionsInChain: Transaction[]
  totalSizeBytes: number // Total size of all transactions in the pending chain
  totalCurrentFee: string // Total fee of all transactions in the pending chain
  fast: {
    targetFeePerByte: string
    totalRequiredFee: string
    additionalFeeNeeded: string
  },
  medium: {
    targetFeePerByte: string
    totalRequiredFee: string
    additionalFeeNeeded: string
  },
  slow: {
    targetFeePerByte: string
    totalRequiredFee: string
    additionalFeeNeeded: string
  }
}
```

`targetFeePerByte` - The target fee per byte for the chosen transaction speed. This is the fee that should be used for the CPFP transaction.

`totalRequiredFee` - The total fee required to confirm all transactions in the pending chain.

`additionalFeeNeeded` - The additional fee required to confirm all transactions in the pending chain (totalRequiredFee - totalCurrentFee).


## 🔗 Supported Networks

The CPFP Fee Estimator supports the following networks:

- `Network.BITCOIN`
- `Network.BITCOIN_TESTNET`

By utilizing the CPFP Fee Estimator, developers can significantly improve the likelihood of transaction confirmations in congested network conditions, thereby enhancing the reliability and user experience of their Bitcoin transactions.
