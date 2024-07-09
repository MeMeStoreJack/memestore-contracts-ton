import { contractAddress, toNano, TonClient4, WalletContractV4, internal, fromNano, Address, beginCell, BitString, Cell } from "@ton/ton";
import { mnemonicToPrivateKey, sign, signVerify, keyPairFromSeed, keyPairFromSecretKey } from "ton-crypto";

import { JettonPayoutsMaster, InitJettonWallet, loadInitJettonWallet, storeInitJettonWallet, storeWithdrawTicket, WithdrawTicket, WithdrawTicketContent } from "./output/JettonPayouts_JettonPayoutsMaster";
import { PayoutBeacon } from "./output/JettonPayouts_PayoutBeacon";

import { JettonMasterUSDT, storeTokenTransfer } from "./output/JettonUSDT_JettonMasterUSDT";
import { JettonDefaultWallet } from "./output/JettonUSDT_JettonDefaultWallet";

import { createWithdrawTicketMsg } from "./Payouts.tickets"

import { content } from "./JettonUSDT.spec";

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
    let verifierMnemonics = (process.env.BACKEDN || "").toString();
    let secretKey = keyPair.secretKey;
    let workchain = 0; //we are working in basechain.
    let deployer_wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    console.log(deployer_wallet.address);

    let deployer_wallet_contract = client4.open(deployer_wallet);


    // Compute init data for deployment
    // NOTICE: the parameters inside the init functions were the input for the contract address
    // which means any changes will change the smart contract address as well
    console.log("pubkey buf hex: ", keyPair.publicKey.toString("hex"));
    // let pubKey = beginCell().storeBuffer(keyPair.publicKey).endCell().beginParse().loadUintBig(256); // Convert to uint256
    let pubKey = 0x164bc240cb26e4593ac474be8bf4a60d1df23d134a81d89aae3dac5279d7b023n;
    let usdtJettonMaster = Address.parse("kQCqm4niLh9ozIEmk4Ub2Avx0Ba0jiGOlc25jdlfUs3zl6GV");
    let usdtJettonMasterContract = client4.open(JettonMasterUSDT.fromAddress(usdtJettonMaster));
    let usdtJettonMasterInit = await JettonMasterUSDT.init(deployer_wallet.address, content);

    let jettonPayoutsMasterInit = await JettonPayoutsMaster.init(deployer_wallet.address, pubKey, usdtJettonMaster);
    let jettonPayoutsMaster = contractAddress(workchain, jettonPayoutsMasterInit);
    console.log("JettonPayoutsMaster: ", jettonPayoutsMaster.toString());
    let fairMintAmount = toNano("1.1");

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

    // Payouts address: kQAiL_EralRCIRBPR4o4uF25x87AVcBBqA_oEf9qawDXOTVc
    // payout0 txid: b0b38406e7f16db8d02347c132f7aff82f990c993fa5b07edebc93e7bfd52c06
    // payout1 txid: 0041cb5d41ca0f23c0bedbc384fc4ee7c49a89b085e3cb188f2e37d494d3b826
    // payout2 txid: 1a77ceacc3f2d4e03092e10d020d8e217d9ad168d3530eb569b22d2edcbaed01
    // await deployer_wallet_contract.sendTransfer({
    //     seqno,
    //     secretKey,
    //     messages: [
    //         internal({
    //             to: jettonPayoutsMaster,
    //             value: toNano("0.3"),
    //             init: {
    //                 code: jettonPayoutsMasterInit.code,
    //                 data: jettonPayoutsMasterInit.data,
    //             },
    //             body: "deploy",
    //         }),
    //     ],
    // });
    // console.log("====== deploy message sent to =======\n", jettonPayoutsMaster);
    // return;

    let jettonPayoutsUsdtJettonWallet = await usdtJettonMasterContract.getGetWalletAddress(jettonPayoutsMaster);
    console.log("jettonPayoutsUsdtJettonWallet: ", jettonPayoutsUsdtJettonWallet.toString());

    let deployerUsdtJettonWallet = await usdtJettonMasterContract.getGetWalletAddress(deployer_wallet.address);
    console.log("deployerUsdtJettonWallet: ", deployerUsdtJettonWallet.toString());

    let testUsdtJettonWallet = await usdtJettonMasterContract.getGetWalletAddress(Address.parse("0QCQPe8hx6TQSG9Sqx519otMbgkKOHRMNeBZjgt2JGIHRqVO"));
    console.log("testUsdtJettonWallet: ", testUsdtJettonWallet.toString());

    let backendVerifier = Address.parse("0QBxuQpzKQ1ApwzZoD54C9Ejw6ZdCnBdRyyoGYCFAxEEm67-");

    let initJettonWalletMsg = beginCell()
        .store(
            storeInitJettonWallet({
                $$type: "InitJettonWallet",
                jetton_wallet: jettonPayoutsUsdtJettonWallet,
            })
        )
        .endCell();

    // await deployer_wallet_contract.sendTransfer({
    //     seqno: seqno,
    //     secretKey,
    //     messages: [
    //         internal({
    //             to: jettonPayoutsMaster,
    //             value: toNano("0.2"),
    //             init: {
    //                 code: jettonPayoutsMasterInit.code,
    //                 data: jettonPayoutsMasterInit.data,
    //             },
    //             body: initJettonWalletMsg,
    //         }),
    //     ],
    // });
    // return;

    let transfer_usdt_to_payouts = beginCell().store(
        storeTokenTransfer({
            $$type: "TokenTransfer",
            query_id: BigInt(0),
            amount: toNano("1000000"),
            destination: jettonPayoutsMaster,
            response_destination: deployer_wallet.address,
            custom_payload: null,
            forward_ton_amount: toNano("0"), // if add this, 130 fail, TransferNotification
            forward_payload: beginCell().endCell(),
        }),
    ).endCell();

    // await deployer_wallet_contract.sendTransfer({
    //     seqno: seqno,
    //     secretKey,
    //     messages: [
    //         internal({
    //             to: deployerUsdtJettonWallet,
    //             value: fairMintAmount,
    //             init: {
    //                 code: usdtJettonMasterInit.code,
    //                 data: usdtJettonMasterInit.data,
    //             },
    //             body: transfer_usdt_to_payouts,
    //         }),
    //     ],
    // });

    // return;

    let sender = deployer_wallet.address;
    console.log("sender", sender);
    let amount = toNano("1000");
    // let oneWeekLater = BigInt(Math.floor(Date.now() / 1000)) + BigInt(60 * 60 * 24 * 7);
    let oneWeekLater = BigInt(2234567890)
    // let payout_id = BigInt(randomInt(0, 2**64 - 1)); // 后端数据库支付记录的唯一标识
    let payout_id = BigInt(1111);
    let payout_id2 = BigInt(2222);
    let payout_id3 = BigInt(3333);
    let ticket = createWithdrawTicketMsg(sender, amount, BigInt(0), oneWeekLater, payout_id, usdtJettonMaster, keyPair.secretKey);
    console.log(ticket);
    let packed_ticket_msg = beginCell().store(storeWithdrawTicket(ticket)).endCell();
    // return;

    // {
    //     "address": "0:5e13a4181d5aed8eb09e9b05189c661915533d3242574b0b14456645d7716471",
    //     "value": 1700000000,
    //     "nonce": 0,
    //     "expire": 1718676894,
    //     "payoutId": 13,
    //     "jettonWallet": "EQC1uTfHPa4FPsW3EXudo3wR72phEQqAeRisuZGYJaSALszH",
    //     "signature": "699a2259ef641e0e063400e6d0f79b01ea9d66e1738312155cd9ba643095f02319e80b0b8fec700eef1e1f7fc48538d939e536100f5b06bbdc6a4c0bab0a7b01"
    // }

    let wtContent: WithdrawTicketContent = {
        $$type: "WithdrawTicketContent",
        address: Address.parseRaw("0:903def21c7a4d0486f52ab1e75f68b4c6e090a38744c35e0598e0b7624620746"),
        value: 1900000000n,
        expire: 1728694528n,
        nonce: 0n,
        payout_id: 31n,
        jetton_wallet: Address.parse("EQCqm4niLh9ozIEmk4Ub2Avx0Ba0jiGOlc25jdlfUs3zlxof"),
    }
    let withdrawTicket: WithdrawTicket = {
        $$type: "WithdrawTicket",
        ticket: wtContent,
        signature: beginCell().storeBuffer(Buffer.from("dd2652c3fdb9f5b6b3389ffdf4fb61f9a95f43f8681d3e450c70a5d20ffad0dcaa87cb094c4fb8d1bc20617a3c29428c14b62af32fac19fcb8f57ab08bf7c004", "hex")).endCell()
    }
    let my_packed_ticket_msg = beginCell().store(storeWithdrawTicket(withdrawTicket)).endCell();
    console.log("my_packed_ticket_msg: ", my_packed_ticket_msg);
    // return;

    await deployer_wallet_contract.sendTransfer({
        seqno: seqno,
        secretKey,
        messages: [
            internal({
                to: jettonPayoutsMaster,
                value: fairMintAmount,
                // init: {
                //     code: jettonPayoutsMasterInit.code,
                //     data: jettonPayoutsMasterInit.data,
                // },
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
    console.log("====== payout message sent to =======\n", jettonPayoutsMaster);
})();
