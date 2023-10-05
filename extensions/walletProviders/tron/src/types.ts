export type XpubWithMnemonic = {
  xpub: string
  mnemonic: string
  derivationPath: string
}

export type TronWallet = {
  address: string
  privateKey: string
  mnemonic: string
}

export type TronTxPayload = {
  /**
   * Private key of the address, from which the TRX will be sent.
   */
  fromPrivateKey: string;
  /**
   * Recipient address of TRON account in Base58 format.
   */
  to: string;
  /**
   * Amount to be sent in TRX.
   */
  amount: string;
}

export type TronTransactionValue = {
    amount: number
    owner_address: string
    to_address: string
}

export type TronTransactionHeaderInfo = {
  ref_block_bytes: string
  ref_block_hash: string
  expiration: number
  timestamp: number
}
