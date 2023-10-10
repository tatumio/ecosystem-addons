# 🌍 UTXO Wallet Provider

UTXO Wallet Provider integrates seamlessly with Tatum SDK to provide extended wallet capabilities for UTXO-based blockchains.

## 📖 Description

The UTXO Wallet Provider provides an array of tools for:

- Generating mnemonics for seed phrases.
- Creating extended public keys (xpubs) from mnemonics.
- Deriving private keys and addresses from mnemonics and xpubs.
- Signing and broadcasting transactions to the UTXO-based networks.

It is built upon popular packages like `bitcoinjs-lib`, `bitcore-lib`, `bip39`, and `bip32`, ensuring a robust and secure foundation.

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

## ⚙️ Configuration

   You can configure the `UtxoWalletProvider` as below to have all the checks skipped. This is useful for development and testing purposes.

   ```typescript
   const tatumSdk = await TatumSDK.init<Bitcoin>({
        network: Network.BITCOIN,
        configureWalletProviders: [
           {type: UtxoWalletProvider, config: {skipAllChecks: true}},
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
      fromAddress: [{ address: 'tb1qjzjyd3l3vh8an8w4mkr6dwur59lan60367kr04', privateKey: 'YOUR_PRIVATE_KEY'}],
      to: [{ address: 'tb1q5gtkjxguam0mlvevwxf2q9ldnq8ladenlhn3mw', value: 0.0001 }],
      fee: '0.00001',
      changeAddress: 'tb1qjzjyd3l3vh8an8w4mkr6dwur59lan60367kr04',
      }
   const txHash = await tatumSdk.walletProvider.use(UtxoWalletProvider).signAndBroadcast(payload);
   ```

Remember to always ensure the safety of mnemonics, private keys, and other sensitive data. Never expose them in client-side code or public repositories.

## 🔗🔗 Supported Networks

```typescript
Network.BITCOIN,
Network.DOGECOIN,
Network.LITECOIN,
Network.BITCOIN_TESTNET,
Network.DOGECOIN_TESTNET,
Network.LITECOIN_TESTNET
```
