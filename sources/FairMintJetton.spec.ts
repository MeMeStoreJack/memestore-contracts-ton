import { buildOnchainMetadata } from "./utils/jetton-helpers";
import {
    Blockchain,
    SandboxContract,
    TreasuryContract,
    printTransactionFees,
    prettyLogTransactions,
    RemoteBlockchainStorage,
    wrapTonClient4ForRemote,
} from "@ton/sandbox";
import "@ton/test-utils";
import { Address, beginCell, fromNano, StateInit, toNano } from "@ton/core";
import { TonClient4 } from "@ton/ton";
import { printSeparator } from "./utils/print";

// -------- Contract SDK --------
import { FairMintJetton, FairMint, TokenTransfer, MintConfig, TradeConfig, loadFairMintEvent} from "./output/FairMintJetton_FairMintJetton";
import { JettonDefaultWallet, TokenBurn } from "./output/FairMintJetton_JettonDefaultWallet";
import { loadTradeStepEvent } from "./output/FairMintJetton_FairMintJetton";

const jettonParams = {
    name: "meme",
    description: "fairmint meme",
    symbol: "MEME",
    image: "https://play-lh.googleusercontent.com/ahJtMe0vfOlAu1XJVQ6rcaGrQBgtrEZQefHy7SXB7jpijKhu1Kkox90XDuH8RmcBOXNn",
};
let content = buildOnchainMetadata(jettonParams);
let max_supply = toNano(1_000_000_000n); // Set the specific total supply in nano
let mint_config: MintConfig = {
    $$type: "MintConfig",
    mint_supply: toNano("1000"),
    mint_price: toNano("0.1"),
    single_mint_min: toNano("1"),
    single_mint_max: toNano("1000"),
    mint_max: toNano("1000"),
    end_timestamp: 1000000000000n,
    liquidity_price: toNano("0.1"),
}

let trade_config: TradeConfig = {
    $$type: "TradeConfig",
    swap_router: Address.parse("EQBsGx9ArADUrREB34W-ghgsCgBShvfUr4Jvlu-0KGc33Rbt"),
    target_amount: toNano("1000"),
    proxy_ton: Address.parse("kQAcOvXSnnOhCdLYc6up2ECYwtNNTzlmOlidBeCs5cFPV7AM"), // testnet proxy ton
    ton_value_add_meme: toNano("0.3"),
    ton_value_add_pton: toNano("0.3"),
    router_pton_wallet: Address.parse("EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"), // mainnet router pton wallet
}

let protocol_receiver = Address.parse("EQDW_iCkT4kdaU3WiltCN1bzwq5ST--yFXpVgyuMAYb3rvQu");

describe("FairMintJetton", () => {
    let blockchain: Blockchain;
    let token: SandboxContract<FairMintJetton>;
    let jettonWallet: SandboxContract<JettonDefaultWallet>;
    let deployer: SandboxContract<TreasuryContract>;
    // let player: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        // Create content Cell

        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury("deployer");
        // player = await blockchain.treasury("player");

        protocol_receiver = deployer.address;

        token = blockchain.openContract(await FairMintJetton.fromInit(deployer.address, content, max_supply, mint_config, trade_config, protocol_receiver));

        // Send Transaction
        const deployResult = await token.send(deployer.getSender(), { value: toNano("1") }, "deploy");
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            deploy: true,
            success: true,
        });

        const playerWallet = await token.getGetWalletAddress(deployer.address);
        jettonWallet = blockchain.openContract(JettonDefaultWallet.fromAddress(playerWallet));
    });

    it("Test: whether contract deployed successfully", async () => {
        // the check is done inside beforeEach, blockchain and token are ready to use
        // console.log((await token.getGetJettonData()).owner);
        // console.log((await token.getGetJettonData()).total_supply);
        // console.log((await token.getGetJettonData()).content);
    });

    it("Test: should fairmint successfully", async () => {
        const totalSupplyBefore = (await token.getGetJettonData()).total_supply;
        console.log("Total Supply Before: " + fromNano(totalSupplyBefore));
        const mintAmount = toNano("1");
        const fairMint: FairMint = {
            $$type: "FairMint",
            ton_value: toNano("1"),
            amount: mintAmount,
            receiver: deployer.address,
        };

        const fairMintResult = await token.send(deployer.getSender(), { value: toNano("1.01") }, fairMint);
        expect(fairMintResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            success: true,
        });
        // printTransactionFees(fairMintResult.transactions);
        // printSeparator();

        // console.log("External Message(body): ", fairMintResult.externals[0].body.toBoc());
        // console.log("External Message(string - base64): ", fairMintResult.externals[0].body.toBoc().toString("base64"));
        // console.log("External Message(hex): ", fairMintResult.externals[0].body.toBoc().toString("hex") + "\n");
        // printSeparator();

        let loadEvent = loadFairMintEvent(fairMintResult.externals[0].body.asSlice());
        // console.log("type:", loadEvent.$$type);
        // console.log("sender:", loadEvent.sender);
        // console.log("amount:", loadEvent.amount);


        const totalSupplyAfter = (await token.getGetJettonData()).total_supply;
        console.log("Total Supply After: " + fromNano(totalSupplyAfter));
        expect(totalSupplyBefore + mintAmount).toEqual(totalSupplyAfter);

        const walletData = await jettonWallet.getGetWalletData();
        expect(walletData.owner).toEqualAddress(deployer.address);
        console.log("Wallet Balance: " + fromNano(walletData.balance));
        expect(walletData.balance).toBeGreaterThanOrEqual(mintAmount);
    });

    it("Test: should fairmint to max supply successfully", async () => {
	return;
        const totalSupplyBefore = (await token.getGetJettonData()).total_supply;
        console.log("Total Supply Before: " + fromNano(totalSupplyBefore));
        console.log("Max Supply: ", max_supply);

        const mintAmount = mint_config.mint_supply;
        const fairMint: FairMint = {
            $$type: "FairMint",
            ton_value: mintAmount * mint_config.mint_price / toNano("1"),
            amount: mintAmount,
            receiver: deployer.address,
        };

        const fairMintResult = await token.send(deployer.getSender(), { value: mintAmount * mint_config.mint_price / toNano("1") + toNano("0.8") }, fairMint);
        expect(fairMintResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            success: true,
        });
        printTransactionFees(fairMintResult.transactions);
        // printSeparator();

        console.log("External Message length: ", fairMintResult.externals.length);
        console.log("External[0] Message(body): ", fairMintResult.externals[0].body.toBoc());
        console.log("External[0] Message(string - base64): ", fairMintResult.externals[0].body.toBoc().toString("base64"));
        console.log("External[0] Message(hex): ", fairMintResult.externals[0].body.toBoc().toString("hex") + "\n");

        console.log("External[1] Message(body): ", fairMintResult.externals[1].body.toBoc());
        console.log("External[1] Message(string - base64): ", fairMintResult.externals[1].body.toBoc().toString("base64"));
        console.log("External[1] Message(hex): ", fairMintResult.externals[1].body.toBoc().toString("hex") + "\n");
        printSeparator();

        if (fairMintResult.externals.length > 1) {
            let tradeEvent = loadTradeStepEvent(fairMintResult.externals[0].body.asSlice());
            console.log("type:", tradeEvent.$$type);
            console.log("trade_step:", tradeEvent.trade_step);
        }

        let loadEvent = loadFairMintEvent(fairMintResult.externals[fairMintResult.externals.length-1].body.asSlice());
        console.log("type:", loadEvent.$$type);
        console.log("sender:", loadEvent.sender);
        console.log("amount:", loadEvent.amount);

        const totalSupplyAfter = (await token.getGetJettonData()).total_supply;
        console.log("Total Supply After: " + fromNano(totalSupplyAfter));
        expect(totalSupplyBefore + mintAmount).toBeLessThanOrEqual(totalSupplyAfter);

        const walletData = await jettonWallet.getGetWalletData();
        expect(walletData.owner).toEqualAddress(deployer.address);
        console.log("Wallet Balance: " + fromNano(walletData.balance));
        expect(walletData.balance).toBeGreaterThanOrEqual(mintAmount);
    });

    it("Test: should createPoolWithExpired successfully", async () => {
        return;
        const createPoolResult = await token.send(deployer.getSender(), { value: toNano("1") }, "createPoolWithExpired");
        expect(createPoolResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            success: true,
        });
        printTransactionFees(createPoolResult.transactions);
    });
});
