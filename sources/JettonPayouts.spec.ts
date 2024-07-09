import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees } from "@ton/sandbox";
import { mnemonicToPrivateKey } from "ton-crypto";
import { KeyPair } from "@ton/crypto";

import "@ton/test-utils";
import { Address, beginCell, fromNano, StateInit, toNano } from "@ton/core";
import { TonClient4 } from "@ton/ton";
import { printSeparator } from "./utils/print";

import { JettonPayoutsMaster} from "./output/JettonPayouts_JettonPayoutsMaster";
import { PayoutBeacon } from "./output/JettonPayouts_PayoutBeacon";

import { JettonMasterUSDT } from "./output/JettonUSDT_JettonMasterUSDT";
import { JettonDefaultWallet } from "./output/JettonUSDT_JettonDefaultWallet";
import { jettonParams, content } from "./JettonUSDT.spec";
import { createWithdrawTicketMsg } from "./Payouts.tickets";
import * as dotenv from "dotenv";
dotenv.config();

describe("JettonPayouts", () => {
    let blockchain: Blockchain;
    let payouts: SandboxContract<JettonPayoutsMaster>;
    let beaconWallet: SandboxContract<PayoutBeacon>;
    let deployer: SandboxContract<TreasuryContract>;
    let token: SandboxContract<JettonMasterUSDT>;
    let jettonWallet: SandboxContract<JettonDefaultWallet>;
    let keyPair: KeyPair;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury("deployer");
        // let pubkey = 1n;
        let owner = deployer.address;
        // let pubkey = 1n;

        let mnemonics = (process.env.mnemonics_2 || "").toString(); // 🔴 Change to your own, by creating .env file!
        console.log(`mnemonics: ${mnemonics}`);
        keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));

        let pubkey = beginCell().storeBuffer(keyPair.publicKey).endCell().beginParse().loadUintBig(256);
        console.log("pubkey buf hex: ", keyPair.publicKey.toString("hex"));

        token = blockchain.openContract(await JettonMasterUSDT.fromInit(deployer.address, content));

        var deployResult = await token.send(deployer.getSender(), { value: toNano("0.3") }, "deploy");
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            deploy: true,
            success: true,
        });

        const playerWallet = await token.getGetWalletAddress(deployer.address);
        jettonWallet = blockchain.openContract(JettonDefaultWallet.fromAddress(playerWallet));
        
        payouts = blockchain.openContract(await JettonPayoutsMaster.fromInit(owner, pubkey, token.address))

        deployResult = await payouts.send(deployer.getSender(), { value: toNano("1") }, "deploy");
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: payouts.address,
            deploy: true,
            success: true,
        });
    });

    it("Test: should deploy ok", async () => {
        console.log("Payouts address: ", payouts.address.toString());
        console.log("Payouts owner: ", await payouts.getOwner());
        expect(await payouts.getJettonMaster()).toEqualAddress(token.address);
    });

    it("Test: should verify signature ok", async () => {
        let nonce = BigInt(0);
        let amount = toNano("0.01");
        // let oneWeekLater = BigInt(Math.floor(Date.now() / 1000)) + BigInt(60 * 60 * 24 * 7);
        let oneWeekLater = BigInt(2234567890)
        let payout_id = BigInt(1111); // 后端数据库支付记录的唯一标识
        let fake_sec_key = keyPair.secretKey;
        let ticket = createWithdrawTicketMsg(deployer.address, toNano("1000"), nonce, oneWeekLater, payout_id, jettonWallet.address, fake_sec_key);

        let withdrawResult = await payouts.send(deployer.getSender(), { value: toNano("0.6") }, ticket);
        printTransactionFees(withdrawResult.transactions);
        expect(withdrawResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: payouts.address,
            success: true,
        });
    });
});
    