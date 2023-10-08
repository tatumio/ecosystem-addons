# 🌍 UTXO Wallet Provider

UTXO Wallet Provider integrates seamlessly with Tatum SDK to provide extended wallet capabilities for UTXO-based blockchains.

## 📖 Description

The UTXO Wallet Provider provides an array of tools for:

- Generating mnemonics for seed phrases.
- Creating extended public keys (xpubs) from mnemonics.
- Deriving private keys and addresses from mnemonics and xpubs.
- Signing and broadcasting transactions to the UTXO-based networks.

It is built upon popular packages like `bitcoinjs-lib`, `bip39`, and `bip32`, ensuring a robust and secure foundation.

## 🚀 Quick Start

1. **Installation**

   Firstly, ensure that the `@tatumio/utxo-wallet-provider` package is set as a dependency within your project. Next, import the UTXO Wallet Provider extension:

   ```typescript
   import { UtxoWalletProvider } from '@tatumio/utxo-wallet-provider';
   ```

2. **Initialization**

   Create an instance of Tatum SDK passing `UtxoWalletProvider` as one of wallet providers.

   ```typescript
   const tatumSdk = await TatumSDK.init<Bitcoin>({
        network: Network.BITCOIN,
        configureWalletProviders: [
            UtxoWalletProvider,
        ]
    })
   ```

## 🛠️ How to Use

1. **Generate Mnemonic**

   ```typescript
   const mnemonic = tatumSdk.walletProvider.use(UtxoWalletProvider).generateMnemonic();
   ```

2. **Generate xpub with or without Mnemonic**

   ```typescript
   const xpubDetails = await tatumSdk.walletProvider.use(UtxoWalletProvider).generateXpub(mnemonic);
   ```

3. **Generate Private Key from Mnemonic**

   ```typescript
   const privateKey = await tatumSdk.walletProvider.use(UtxoWalletProvider).generatePrivateKeyFromMnemonic(mnemonic, 0);
   ```

4. **Generate Address from Mnemonic or xpub**

   ```typescript
   const addressFromMnemonic = await tatumSdk.walletProvider.use(UtxoWalletProvider).generateAddressFromMnemonic(mnemonic, 0);
   const addressFromXpub = await tatumSdk.walletProvider.use(UtxoWalletProvider).generateAddressFromXpub(xpubDetails.xpub, 0);
   ```

5. **Sign and Broadcast a Transaction**

   Define your payload according to the `UtxoTxPayload` type:

   ```typescript
   const payload = {
     privateKey: 'YOUR_PRIVATE_KEY',
     // other fields for your transaction...
   }
   const txHash = await tatumSdk.walletProvider.use(UtxoWalletProvider).signAndBroadcast(payload);
   ```

Remember to always ensure the safety of mnemonics, private keys, and other sensitive data. Never expose them in client-side code or public repositories.

## 🔗🔗 Supported Networks

```typescript
Network.BITCOIN,
Network.DOGECOIN,
Network.LITECOIN,
Network.BITCOIN_CASH,
Network.BITCOIN_TESTNET,
Network.DOGECOIN_TESTNET,
Network.LITECOIN_TESTNET,
Network.BITCOIN_CASH_TESTNET
```
