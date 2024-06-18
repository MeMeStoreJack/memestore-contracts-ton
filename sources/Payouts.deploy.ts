import { contractAddress, toNano, TonClient4, WalletContractV4, internal, fromNano, Address, beginCell, BitString, Cell } from "@ton/ton";
import { mnemonicToPrivateKey, sign, signVerify, keyPairFromSeed, keyPairFromSecretKey } from "ton-crypto";

import { PayoutsMaster, WithdrawTicket, WithdrawTicketContent, storeWithdrawTicket } from "./output/Payouts_PayoutsMaster";
import { PayoutBeacon } from "./output/Payouts_PayoutBeacon";

import { createUniqTicket, createTonWithdrawTicketMsg } from "./Payouts.tickets"

import { printSeparator } from "./utils/print";
import * as dotenv from "dotenv";
import { KeyPair } from "@ton/crypto";
import { randomInt } from "crypto";
dotenv.config();

(async () => {
    const client4 = new TonClient4({
        endpoint: "https://testnet-v4.tonhubapi.com",
        timeout: 20_000_000,
    });

    let mnemonics = (process.env.mnemonics_2 || "").toString(); // 🔴 Change to your own, by creating .env file!
    console.log(`mnemonics: ${mnemonics}`);
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0; //we are working in basechain.
    let deployer_wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    console.log(deployer_wallet.address);

    let deployer_wallet_contract = client4.open(deployer_wallet);

    // Compute init data for deployment
    // NOTICE: the parameters inside the init functions were the input for the contract address
    // which means any changes will change the smart contract address as well
    console.log("pubkey buf hex: ", keyPair.publicKey.toString("hex"));
    let pubKey = beginCell().storeBuffer(keyPair.publicKey).endCell().beginParse().loadUintBig(256); // Convert to uint256
    let init = await PayoutsMaster.init(deployer_wallet.address, pubKey);
    let jettonMaster = contractAddress(workchain, init);
    let fairMintAmount = toNano("1.15");

    // send a message on new address contract to deploy it
    let seqno: number = await deployer_wallet_contract.getSeqno();
    console.log("🛠️Preparing new outgoing massage from deployment wallet. \n" + deployer_wallet_contract.address);
    console.log("Seqno: ", seqno + "\n");
    printSeparator();

    // Get deployment wallet balance
    let balance: bigint = await deployer_wallet_contract.getBalance();

    console.log("Current deployment wallet balance = ", fromNano(balance).toString(), "💎TON");
    printSeparator();
    // return;

    // await deployer_wallet_contract.sendTransfer({
    //     seqno,
    //     secretKey,
    //     messages: [
    //         internal({
    //             to: jettonMaster,
    //             value: fairMintAmount,
    //             init: {
    //                 code: init.code,
    //                 data: init.data,
    //             },
    //             body: "deploy",
    //         }),
    //     ],
    // });
    // console.log("====== deploy message sent to =======\n", jettonMaster);
    // return;

    let sender = deployer_wallet.address;
    console.log("sender", sender);
    let amount = toNano("0.01");
    // let oneWeekLater = BigInt(Math.floor(Date.now() / 1000)) + BigInt(60 * 60 * 24 * 7);
    let oneWeekLater = BigInt(21234567890)
    // let payout_id = BigInt(randomInt(0, 2**64 - 1)); // 后端数据库支付记录的唯一标识
    let payout_id = BigInt(1111);
    let payout_id2 = BigInt(2222);
    let payout_id3 = BigInt(3333);
    let withdrawTicket = createTonWithdrawTicketMsg(sender, amount, BigInt(0), oneWeekLater, payout_id, keyPair.secretKey);
    let my_packed_ticket_msg = beginCell().store(storeWithdrawTicket(withdrawTicket)).endCell();
    console.log("my_packed_ticket_msg: ", my_packed_ticket_msg.toBoc().toString("base64"));
    return;

    await deployer_wallet_contract.sendTransfer({
        seqno: seqno,
        secretKey,
        messages: [
            internal({
                to: jettonMaster,
                value: fairMintAmount,
                init: {
                    code: init.code,
                    data: init.data,
                },
                body: my_packed_ticket_msg,
            }),
        ],
    });

    // await deployer_wallet_contract.sendTransfer({
    //     seqno: seqno,
    //     secretKey,
    //     messages: [
    //         internal({
    //             to: jettonMaster,
    //             value: fairMintAmount,
    //             init: {
    //                 code: init.code,
    //                 data: init.data,
    //             },
    //             body: "Withdraw",
    //         }),
    //     ],
    // });
    console.log("====== payout message sent to =======\n", jettonMaster);
})();
