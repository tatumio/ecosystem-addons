import { Kadena, Network, TatumSDK } from "@tatumio/tatum";
import { KadenaUtils } from "@tatum/kadena-utils";
import { KadenaWalletProvider } from "@tatumio/kadena-wallet-provider";
import { ICommandPayload } from "@kadena/types";

const run = async () => {
    const tatumSdk = await TatumSDK.init<Kadena>({
        network: Network.KADENA_TESTNET,
        configureExtensions: [KadenaUtils],
        configureWalletProviders: [KadenaWalletProvider]
    })
    try {

        const uri = 'ipfs://example-uri4';
        const secretKey = '3a4fbaee6985cd7b6ac5cc7db0609ef1bc51aa636aa8639ebe69c46c570c8f42'
        const publicKey = 'b76d05d9519343d3d8aab322bbe99222e9b925c94f80f1118165f7f00389a3e9'
        const chainId = '1'

        const command = await tatumSdk.extension(KadenaUtils).mintBasicNFT(uri, publicKey, chainId)
        //const txId = await tatumSdk.walletProvider.use(KadenaWalletProvider).signAndBroadcast({command, secretKey})
        //const command = await tatumSdk.extension(KadenaUtils).burnNFT('t:TmrA24AauQG4WNkJRvk9bVTZBzvskYEadh7cdbUebBc', publicKey, chainId)
        const txId = await tatumSdk.walletProvider.use(KadenaWalletProvider).signAndBroadcast({command, secretKey})
        console.log(command);
        const payload: ICommandPayload = JSON.parse(command.cmd)
        console.log({
            cmd: {
                ...payload,
                payload: {exec: JSON.stringify(payload.payload['exec'])},
                signers: payload.signers.map(signer => JSON.stringify(signer))
            },
            hash: command.hash,
            sigs: command.sigs
        });
        console.log(txId);
    } catch (e) {
        console.error(e);
    } finally {
        await tatumSdk.destroy()
    }
};

run();
