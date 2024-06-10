# 🌍 Kadena Wallet Provider

Kadena Wallet Provider integrates seamlessly with Tatum SDK to provide extended wallet capabilities for Kadena.

## 📖 Description

The Kadena Wallet Provider provides an array of tools for:

- Generating mnemonics for seed phrases.
- Generating and deriving private keys and addresses from mnemonics.
- Signing and broadcasting transactions to the Kadena network.

It is built upon popular packages like `@kadena/client`, ensuring a robust and secure foundation.

## 🚀 Quick Start

1. **Installation**

   Firstly, ensure that the `@tatumio/kadena-wallet-provider` package is set as a dependency within your project. Next, import the Kadena Wallet Provider extension:

   ```typescript
   import { KadenaWalletProvider } from '@tatumio/kadena-wallet-provider'
   ```

2. **Initialization**

   Create an instance of Tatum SDK passing `KadenaWalletProvider` as one of wallet providers.

   ```typescript
   const tatumSdk = await TatumSDK.init<Kadena>({
     network: Network.KADENA,
     configureWalletProviders: [KadenaWalletProvider],
   })
   ```

## 🛠️ How to Use

1. **Generate Mnemonic**

   ```typescript
   const mnemonic = tatumSdk.walletProvider.use(KadenaWalletProvider).generateMnemonic()
   ```

2. **Generate Private Key from Mnemonic**

   ```typescript
   const privateKey = await tatumSdk.walletProvider
     .use(KadenaWalletProvider)
     .generatePrivateKeyFromMnemonic(mnemonic)
   ```

3. **Generate Address from Private key**

   ```typescript
   const address = await tatumSdk.walletProvider
     .use(KadenaWalletProvider)
     .generateAddressFromPrivateKey(privateKey)
   ```

4. **Get Private Key, Address and Mnemonic**

   ```typescript
   const { privateKey, address, mnemonic } = await tatumSdk.walletProvider
     .use(KadenaWalletProvider)
     .getWallet()
   ```

5. **Sign and Broadcast a Transaction**

   Define your payload according to the `EvmTxPayload` type:

   ```typescript
   const kadenaTxPayload = {
        privateKey: privateKey,
        to: address,
        amount: 0.1,
      }

   const txHash = await tatumSdk.walletProvider.use(KadenaWalletProvider).signAndBroadcast(kadenaTxPayload)
   ```

Remember to always ensure the safety of mnemonics, private keys, and other sensitive data. Never expose them in client-side code or public repositories.

## 🔗🔗 Supported Networks

```typescript
Network.KADENA, Network.KADENA_TESTNET
```
