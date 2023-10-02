export type XpubWithMnemonic = {
  xpub: string
  mnemonic: string
  derivationPath: string
}

export type EvmWallet = {
  address: string
  privateKey: string
  mnemonic: string
}

export type EvmTxPayload = {
  privateKey: string
  type?: number
  to?: string
  nonce?: number
  gasLimit?: number | string
  gasPrice?: string
  maxPriorityFeePerGas?: string
  maxFeePerGas?: string
  data?: string
  value?: string
}
