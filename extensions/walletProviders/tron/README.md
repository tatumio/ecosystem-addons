# 🌍 Tron Wallet Provider

Tron Wallet Provider integrates seamlessly with Tatum SDK to provide extended wallet capabilities for Tron.

## 📖 Description

The Tron Wallet Provider provides an array of tools for:

- Generating mnemonics for seed phrases.
- Creating extended public keys (xpubs) from mnemonics.
- Deriving private keys and addresses from mnemonics and xpubs.
- Signing and broadcasting transactions to the Tron network.

It is built upon popular packages like `tronweb`, `bip32`, and `bip39`, ensuring a robust and secure foundation.

## 🚀 Quick Start

1. **Installation**

   Firstly, ensure that the `@tatumio/tron-wallet-provider` package is set as a dependency within your project. Next, import the Tron Wallet Provider extension:

   ```typescript
   import { TronWalletProvider } from '@tatumio/tron-wallet-provider'
   ```

2. **Initialization**

   Create an instance of Tatum SDK passing `TronWalletProvider` as one of wallet providers.

   ```typescript
   const tatumSdk = await TatumSDK.init<Tron>({
        network: Network.TRON,
        configureWalletProviders: [
            TronWalletProvider,
        ]
    })
   ```

## 🛠️ How to Use

1. **Generate Mnemonic**

   ```typescript
   const mnemonic = tatumSdk.walletProvider.use(TronWalletProvider).generateMnemonic()
   ```

2. **Generate xpub with or without Mnemonic**

   ```typescript
   const xpubDetails = await tatumSdk.walletProvider.use(TronWalletProvider).generateXpub(mnemonic)
   ```

3. **Generate Private Key from Mnemonic**

   ```typescript
   const privateKey = await tatumSdk.walletProvider.use(TronWalletProvider).generatePrivateKeyFromMnemonic(mnemonic, 0)
   ```

4. **Generate Address from Mnemonic or xpub**

   ```typescript
   const addressFromMnemonic = await tatumSdk.walletProvider.use(TronWalletProvider).generateAddressFromMnemonic(mnemonic, 0)
   const addressFromXpub = await tatumSdk.walletProvider.use(TronWalletProvider).generateAddressFromXpub(xpubDetails.xpub, 0)
   ```

5. **Sign and Broadcast a Transaction**

   Define your payload according to the `TronTxPayload` type:

   ```typescript
   const payloadTron = {
     privateKey: 'YOUR_PRIVATE_KEY',
     to: 'TARGET_WALLET_ADDRESS',
     amount: '0.01' // TRX_AMOUNT
   }
   const txHash = await tatumSdk.walletProvider.use(TronWalletProvider).signAndBroadcast(payloadTron)
   ```

Remember to always ensure the safety of mnemonics, private keys, and other sensitive data. Never expose them in client-side code or public repositories.

## 🔗🔗 Supported Networks

```typescript
Network.TRON,
Network.TRON_SHASTA
```
