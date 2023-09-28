import { hdkey } from 'ethereumjs-wallet'
import { mnemonicToSeed } from 'bip39'
import { DERIVATION_PATHS } from "./consts";
import { Network } from "@tatumio/tatum";

export const getHd = async (mnemonic: string, path: string) => {
  const seed = await mnemonicToSeed(mnemonic)
  const hdwallet = hdkey.fromMasterSeed(seed)

  return hdwallet.derivePath(path)
}

export const getWalletFromHd = (hd: hdkey, index: number) => hd.deriveChild(index).getWallet()

export const getDefaultDerivationPath = (network: Network): string => {
  return DERIVATION_PATHS.get(network) || "m/44'/1'/0'/0";
}
