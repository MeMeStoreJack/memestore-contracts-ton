import { beginCell, contractAddress, toNano, TonClient4, WalletContractV4, internal, fromNano, Address } from "@ton/ton";
import { mnemonicToPrivateKey } from "ton-crypto";
import { buildOnchainMetadata } from "./utils/jetton-helpers";

import { JettonMasterUSDT } from "./output/JettonUSDT_JettonMasterUSDT";
import { JettonDefaultWallet } from "./output/JettonUSDT_JettonDefaultWallet";

import { printSeparator } from "./utils/print";
import * as dotenv from "dotenv";
dotenv.config();


(async () => {
    const client4 = new TonClient4({
        endpoint: "https://testnet-v4.tonhubapi.com",
    });

    let mnemonics = (process.env.mnemonics_2 || "").toString(); // 🔴 Change to your own, by creating .env file!
    console.log(`mnemonics: ${mnemonics}`);
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0; //we are working in basechain.
    let deployer_wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    console.log(deployer_wallet.address);

    let deployer_wallet_contract = client4.open(deployer_wallet);

    const jettonParams = {
        name: "USDT",
        description: "Test USDT",
        symbol: "USDT",
        image: "https://play-lh.googleusercontent.com/ahJtMe0vfOlAu1XJVQ6rcaGrQBgtrEZQefHy7SXB7jpijKhu1Kkox90XDuH8RmcBOXNn",
    };
    // Create content Cell
    let content = buildOnchainMetadata(jettonParams);

    // Compute init data for deployment
    // NOTICE: the parameters inside the init functions were the input for the contract address
    // which means any changes will change the smart contract address as well
    let init = await JettonMasterUSDT.init(deployer_wallet_contract.address, content);
    let jettonMaster = contractAddress(workchain, init);
    let deployTonValue = toNano("0.15");
    let mintTonValue = toNano("0.15");

    // send a message on new address contract to deploy it
    let seqno: number = await deployer_wallet_contract.getSeqno();
    console.log("🛠️Preparing new outgoing massage from deployment wallet. \n" + deployer_wallet_contract.address);
    console.log("Seqno: ", seqno + "\n");
    printSeparator();

    // Get deployment wallet balance
    let balance: bigint = await deployer_wallet_contract.getBalance();

    console.log("Current deployment wallet balance = ", fromNano(balance).toString(), "💎TON");
    printSeparator();

    // await deployer_wallet_contract.sendTransfer({
    //     seqno,
    //     secretKey,
    //     messages: [
    //         internal({
    //             to: jettonMaster,
    //             value: deployTonValue,
    //             init: {
    //                 code: init.code,
    //                 data: init.data,
    //             },
    //             body: "deploy",
    //         }),
    //     ],
    // });
    // console.log("====== Deployment message sent to =======\n", jettonMaster);

    await deployer_wallet_contract.sendTransfer({
        seqno,
        secretKey,
        messages: [
            internal({
                to: jettonMaster,
                value: mintTonValue,
                init: {
                    code: init.code,
                    data: init.data,
                },
                body: "Mint:1000000",
            }),
        ],
    });
    console.log("====== Mint:1000000 message sent to =======\n", jettonMaster);
})();
