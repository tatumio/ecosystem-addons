export type TezosWallet = {
  address: string
  privateKey: string
  mnemonic: string
}

export type TezosTxPayload = {
  /**
   * Private key of the address, from which the XTZ will be sent.
   */
  privateKey: string
  /**
   * Recipient address of Tezos account in Base58 format.
   */
  to: string
  /**
   * Amount to be sent in XTZ.
   */
  amount: number
}
