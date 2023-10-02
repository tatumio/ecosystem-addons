# 🌍 EVM Wallet Provider

EVM Wallet Provider integrates seamlessly with Tatum SDK to provide extended wallet capabilities for EVM-based blockchains.

## 📖 Description

The EVM Wallet Provider provides an array of tools for:

- Generating mnemonics for seed phrases.
- Creating extended public keys (xpubs) from mnemonics.
- Deriving private keys and addresses from mnemonics and xpubs.
- Signing and broadcasting transactions to the EVM-based networks.

It is built upon popular packages like `ethereumjs-wallet`, `ethers`, and `bip39`, ensuring a robust and secure foundation.

## 🚀 Quick Start

1. **Installation**

   Firstly, ensure that the `@tatumio/evm-wallet-provider` package is set as a dependency within your project. Next, import the EVM Wallet Provider extension:

   ```typescript
   import { EvmWalletProvider } from '@tatumio/evm-wallet-provider';
   ```

2. **Initialization**

   Create an instance of Tatum SDK passing `EvmWalletProvider` as one of wallet providers.

   ```typescript
   const tatumSdk = await TatumSDK.init<Ethereum>({
        network: Network.ETHEREUM,
        configureWalletProviders: [
            EvmWalletProvider,
        ]
    })
   ```

## 🛠️ How to Use

1. **Generate Mnemonic**

   ```typescript
   const mnemonic = tatumSdk.walletProvider.use(EvmWalletProvider).generateMnemonic();
   ```

2. **Generate xpub with or without Mnemonic**

   ```typescript
   const xpubDetails = await tatumSdk.walletProvider.use(EvmWalletProvider).generateXpub(mnemonic);
   ```

3. **Generate Private Key from Mnemonic**

   ```typescript
   const privateKey = await tatumSdk.walletProvider.use(EvmWalletProvider).generatePrivateKeyFromMnemonic(mnemonic, 0);
   ```

4. **Generate Address from Mnemonic or xpub**

   ```typescript
   const addressFromMnemonic = await tatumSdk.walletProvider.use(EvmWalletProvider).generateAddressFromMnemonic(mnemonic, 0);
   const addressFromXpub = await tatumSdk.walletProvider.use(EvmWalletProvider).generateAddressFromXpub(xpubDetails.xpub, 0);
   ```

5. **Sign and Broadcast a Transaction**

   Define your payload according to the `EvmTxPayload` type:

   ```typescript
   const payload = {
     privateKey: 'YOUR_PRIVATE_KEY',
     // other fields for your transaction...
   }
   const txHash = await tatumSdk.walletProvider.use(EvmWalletProvider).signAndBroadcast(payload);
   ```

Remember to always ensure the safety of mnemonics, private keys, and other sensitive data. Never expose them in client-side code or public repositories.
