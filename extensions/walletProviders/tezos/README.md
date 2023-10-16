# 🌍 Tezos Wallet Provider

Tezos Wallet Provider integrates seamlessly with Tatum SDK to provide extended wallet capabilities for Tezos.

## 📖 Description

The Tezos Wallet Provider provides an array of tools for:

- Generating mnemonics for seed phrases.
- Generating and deriving private keys and addresses from mnemonics.
- Signing and broadcasting transactions to the Tezos network.

It is built upon popular packages like `@taquito` and `sotez`, ensuring a robust and secure foundation.

## 🚀 Quick Start

1. **Installation**

   Firstly, ensure that the `@tatumio/tezos-wallet-provider` package is set as a dependency within your project. Next, import the Tezos Wallet Provider extension:

   ```typescript
   import { TezosWalletProvider } from '@tatumio/tezos-wallet-provider'
   ```

2. **Initialization**

   Create an instance of Tatum SDK passing `TezosWalletProvider` as one of wallet providers.

   ```typescript
   const tatumSdk = await TatumSDK.init<Tezos>({
     network: Network.TEZOS,
     configureWalletProviders: [
       { type: TezosWalletProvider, config: { rpcUrl: 'https://ghostnet.ecadinfra.com' } },
     ],
   })
   ```

## 🛠️ How to Use

1. **Generate Mnemonic**

   ```typescript
   const mnemonic = tatumSdk.walletProvider.use(TezosWalletProvider).generateMnemonic()
   ```

2. **Generate Private and Public Key from Mnemonic**

   ```typescript
   const { privateKey, address } = await tatumSdk.walletProvider
     .use(TezosWalletProvider)
     .generatePrivateAndPublicKeyFromMnemonic(mnemonic)
   ```

3. **Generate Address from Mnemonic**

   ```typescript
   const addressFromMnemonic = await tatumSdk.walletProvider
     .use(TezosWalletProvider)
     .getPublicKeyFromPrivateKey(privateKey)
   ```

4. **Generate Private Key, Public address and mnemonic**

   ```typescript
   const { privateKey, address, mnemonic } = await tatumSdk.walletProvider
     .use(TezosWalletProvider)
     .getWallet()
   ```

5. **Sign and Broadcast a Transaction**

   Define your payload according to the `TezosTxPayload` type:

   ```typescript
   const payloadTezos = {
     privateKey: 'YOUR_PRIVATE_KEY',
     to: 'TARGET_WALLET_ADDRESS',
     amount: '0.01', // XTZ_AMOUNT
   }
   const txHash = await tatumSdk.walletProvider.use(TezosWalletProvider).signAndBroadcast(payloadTezos)
   ```

Remember to always ensure the safety of mnemonics, private keys, and other sensitive data. Never expose them in client-side code or public repositories.

## 🔗🔗 Supported Networks

```typescript
Network.TEZOS, Network.TEZOS_TESTNET
```
