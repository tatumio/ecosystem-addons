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
  [key: string]: unknown
}
