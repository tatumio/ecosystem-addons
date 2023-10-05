import { Network, TatumSDK, Tron } from "@tatumio/tatum"
import { TronWalletProvider } from "./extension"

describe('TronWalletProvider', () => {
    let tatumSdk: Tron

    beforeEach(async () => {
        tatumSdk = await TatumSDK.init<Tron>(
            {network: Network.TRON_SHASTA,
            configureWalletProviders: [TronWalletProvider]})
    })

    const path = "m/44'/195'/0'/0"
    const mnemonic = "chat pledge host breeze follow joke wonder vendor glance attract skull easy obey devote pave peace estate alone increase plastic major glow deliver addict"
    const xpub = "xpub6FLDUJoYnwKtLyq2DiXLUJ6a6GTacCLKgz3F3t1AH5ncbDrUnyKCkPaSwTh2Qq5Xzwrwk2Bnw8aDktmXXhgoGPWQE5eEiN8vyQSaXuq7s5s"
    const privateKey = "09eba1fe2d55cd9871ed80bc22a7626e4c6fabb7faccf2459e07b90a22682f8a"
    const address = "TNRuAbJRgpRCFmE9id4MmyWeAgKrCkV9c8"

    describe('generateMnemonic', () => {
        it('should generate 24 word mnemonic', () => {
            const result = tatumSdk.walletProvider.use(TronWalletProvider).generateMnemonic()
            expect(result.split(' ')).toHaveLength(24)
        })
    })
    describe('generateXpub', () => {
        it('should generate xpub', async () => {
            const result = await tatumSdk.walletProvider.use(TronWalletProvider).generateXpub()
            expect(result.xpub).toBeTruthy()
            expect(result.mnemonic).toBeTruthy()
            expect(result.derivationPath).toBe(path)
        })
    })

    describe('generateXpub', () => {
        it('should generate xpub from mnemonic', async () => {
            const result = await tatumSdk.walletProvider.use(TronWalletProvider)
                .generateXpub(mnemonic)
            expect(result.xpub).toBe(xpub)
            expect(result.mnemonic).toBe(mnemonic)
            expect(result.derivationPath).toBe(path)
        })
    })

    describe('generatePrivateKeyFromMnemonic', () => {
        it('should generate private key', async () => {
            const result = await tatumSdk.walletProvider.use(TronWalletProvider).generatePrivateKeyFromMnemonic(mnemonic, 0)
            expect(result).toBe(privateKey)
        })
    })

    describe('generateAddressFromMnemonic', () => {
        it('should generate address', async () => {
            const result = await tatumSdk.walletProvider.use(TronWalletProvider).generateAddressFromMnemonic(mnemonic, 0)
            expect(result).toBe(address)
        })
    })

    describe('generateAddressFromXpub', () => {
        it('should generate address from xpub', () => {
            const result = tatumSdk.walletProvider.use(TronWalletProvider).generateAddressFromXpub(xpub, 0)
            expect(result).toBe(address)
        })
    })

    describe('generateAddressFromPrivateKey', () => {
        it('should generate address from private key', () => {
            const result = tatumSdk.walletProvider.use(TronWalletProvider).generateAddressFromPrivateKey(privateKey)
            expect(result).toBe(address)
        })
    })

    describe('getWallet', () => {
        it('should generate wallet', async () => {
            const wallet = await tatumSdk.walletProvider.use(TronWalletProvider).getWallet()
            expect(wallet.address).toBeTruthy()
            expect(wallet.privateKey).toBeTruthy()
            expect(wallet.mnemonic).toBeTruthy()
            expect(wallet.mnemonic.split(' ')).toHaveLength(24)
        })
    })

    describe('signAndBroadcast', () => {
        it('should sign and broadcast transaction', async () => {
            const payload = {
                fromPrivateKey: privateKey,
                to: address,
                amount: '0.001',
            }
            const txHash = await tatumSdk.walletProvider.use(TronWalletProvider).signAndBroadcast(payload)
            expect(txHash).toBeTruthy()
            expect(txHash).toHaveLength(64)
        })
    })
})
