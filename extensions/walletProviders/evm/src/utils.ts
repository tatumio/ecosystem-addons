import { Network } from '@tatumio/tatum'
import { mnemonicToSeed } from 'bip39'
import { hdkey } from 'ethereumjs-wallet'
import { DERIVATION_PATHS, TESTNET_DERIVATION_PATH } from './consts'

export const getHd = async (mnemonic: string, path: string) => {
  const seed = await mnemonicToSeed(mnemonic)
  const hdwallet = hdkey.fromMasterSeed(seed)

  return hdwallet.derivePath(path)
}

export const getWalletFromHd = (hd: hdkey, index: number) => hd.deriveChild(index).getWallet()

export const getDefaultDerivationPath = (network: Network): string => {
  return DERIVATION_PATHS.get(network) || TESTNET_DERIVATION_PATH
}
