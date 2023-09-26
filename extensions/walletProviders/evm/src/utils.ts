import { hdkey } from 'ethereumjs-wallet'
import { mnemonicToSeed } from 'bip39'

export const getHd = async (mnemonic: string, path: string) => {
  const seed = await mnemonicToSeed(mnemonic)
  const hdwallet = hdkey.fromMasterSeed(seed)

  return hdwallet.derivePath(path)
}

export const getWalletFromHd = (hd: hdkey, index: number) => hd.deriveChild(index).getWallet()
