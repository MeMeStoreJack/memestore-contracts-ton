import TonWeb from "tonweb";
import { TonClient, WalletContractV4, internal, toNano, Cell } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { DEX, pTON } from "@ston-fi/sdk";

import * as dotenv from "dotenv";
dotenv.config();

// tx ok: https://tonviewer.com/transaction/3a4a7ed81e3be134e1a5f724f4f0780a6ec9723074d6ce2ad2751595f28b0b08
// tx ok2: https://tonviewer.com/transaction/4f85cbf6164cd2afc0d99741d19f89b76cee1966bae70c0a9b2cea419995236a
const addTonLiquidity = async (
    token: string, // meme token
  ) => {
    let MNEMONIC = (process.env.mnemonics_3 || "").toString(); // 🔴 Change to your own, by creating .env file!
    const TON_API_URL = "https://toncenter.com/api/v2/jsonRPC";
    const client = new TonClient({
        endpoint: TON_API_URL,
        apiKey: process.env.TON_API_KEY,
    });
    
    const keyPair = await mnemonicToPrivateKey(MNEMONIC.split(" "));
    
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
    });
    console.log("wallet public key: ", keyPair.publicKey.toString("hex"));
    
    const contract = client.open(wallet);
    
    const address = wallet.address;
    console.log("wallet address: ", address.toString());

    const router = new DEX.v1.Router({
      tonApiClient: new TonWeb.HttpProvider(TON_API_URL),
    });
    try {
        const txParams = await router.buildProvideLiquidityTonTxParams({
            userWalletAddress: address.toString(),
            proxyTonAddress: pTON.v1.address.toString(),
            otherTokenAddress: token,
            sendAmount: 1001n,
            minLpOut: 1001n,
        });
        console.log("gas:", txParams.gasAmount.toString());
        console.log("to:", txParams.to);
        console.log("payload: ", txParams.payload);

        await contract.sendTransfer({
            seqno: await contract.getSeqno(),
            secretKey: keyPair.secretKey,
            messages: [internal({
                to: txParams.to.toString(),
                // value: BigInt(txParams.gasAmount.toString()),
                value: BigInt(260002002),
                body: Cell.fromBase64(TonWeb.utils.bytesToBase64(await txParams.payload.toBoc())),
            })]
        });
    } catch (e) {
        console.log("error: ", e);
    }
};

(async () => {
    console.log("Adding liquidity...");
    const memeToken = "EQDmGBEM6ZUuuAPS6mammAPXZ5mSQVssyHjkzIS_MnopMaut"; // BCMEME jetton master
    await addTonLiquidity(memeToken);
})();
