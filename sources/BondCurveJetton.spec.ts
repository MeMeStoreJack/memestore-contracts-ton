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
import { BondCurveJetton, TokenTransfer, TradeConfig, Buy, Sell, Initialize, loadBuy, loadBuyEvent } from "./output/BondCurveJetton_BondCurveJetton";
import { JettonDefaultWallet, TokenBurn } from "./output/BondCurveJetton_JettonDefaultWallet";

const jettonParams = {
    name: "BondCurveMEME",
    description: "bond curve meme jetton on boom.fun",
    symbol: "BCMEME",
    image: "https://play-lh.googleusercontent.com/ahJtMe0vfOlAu1XJVQ6rcaGrQBgtrEZQefHy7SXB7jpijKhu1Kkox90XDuH8RmcBOXNn",
};
let content = buildOnchainMetadata(jettonParams);
let max_supply = toNano(1_000_000_000n); // Set the specific total supply in nano
let trade_config: TradeConfig = {
    $$type: "TradeConfig",
    proxy_ton: Address.parse("EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"),
    swap_router: Address.parse("EQDW_iCkT4kdaU3WiltCN1bzwq5ST--yFXpVgyuMAYb3rvQu"),
    target_amount: toNano("4"),
    trade_a: toNano("1.6"),
    ton_value_add_meme: toNano("0.3"),
    ton_value_add_pton: toNano("0.3"),
    trade_fee_percent: 10n, // 10 / 1000
    referrer_percent: 3n, // 3 / 1000
    up_referrer_percent: 2n, // 2 / 1000
    router_pton_wallet: Address.parse("EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"), // mainnet router pton wallet
}

let trade_fee_receiver = Address.parse("EQDW_iCkT4kdaU3WiltCN1bzwq5ST--yFXpVgyuMAYb3rvQu");
let protocol_receiver = Address.parse("EQDW_iCkT4kdaU3WiltCN1bzwq5ST--yFXpVgyuMAYb3rvQu");

describe("BondCurveJetton", () => {
    let blockchain: Blockchain;
    let token: SandboxContract<BondCurveJetton>;
    let jettonWallet: SandboxContract<JettonDefaultWallet>;
    let playerJettonWallet: SandboxContract<JettonDefaultWallet>;
    let deployer: SandboxContract<TreasuryContract>;
    let player: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        // Create content Cell

        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury("deployer");
        player = await blockchain.treasury("player");

        trade_fee_receiver = deployer.address;
        protocol_receiver = deployer.address;

        token = blockchain.openContract(await BondCurveJetton.fromInit(deployer.address, content, max_supply, trade_config, trade_fee_receiver, protocol_receiver, deployer.address));
        const initialize: Initialize = {
            $$type: "Initialize",
            this_supply: 1_000_000_000_000_000_000n,
            buy_ton_value: toNano("0.02"),
            max_buy_percent: 13n, // 1.3%
        }

        const deployResult = await token.send(deployer.getSender(), { value: toNano("1") }, "deploy");
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            deploy: true,
            success: true,
        });;

        // Send Transaction
        const initResult = await token.send(deployer.getSender(), { value: toNano("0.52") }, initialize);
        expect(initResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            deploy: false,
            success: true,
        });
        printTransactionFees(initResult.transactions);

        // const initDeployerWalletResult = await token.send(deployer.getSender(), { value: toNano("0.3") }, "init_jetton_wallet");
        // expect(initDeployerWalletResult.transactions).toHaveTransaction({
        //     from: deployer.address,
        //     to: token.address,
        //     success: true,
        // });
        const deployerWallet = await token.getGetWalletAddress(deployer.address);
        jettonWallet = blockchain.openContract(JettonDefaultWallet.fromAddress(deployerWallet));

        let balance = (await jettonWallet.getGetWalletData()).balance;
        console.log("init buy token balance: " + fromNano(balance));

        const initPlayerWalletResult = await token.send(player.getSender(), { value: toNano("0.3") }, "init_jetton_wallet");
        expect(initPlayerWalletResult.transactions).toHaveTransaction({
            from: player.address,
            to: token.address,
            success: true,
        });
        const playerWallet = await token.getGetWalletAddress(player.address);
        playerJettonWallet = blockchain.openContract(JettonDefaultWallet.fromAddress(playerWallet));
    });

    it("Test: whether contract deployed successfully", async () => {
        // the check is done inside beforeEach, blockchain and token are ready to use
        // console.log((await token.getGetJettonData()).owner);
        // console.log((await token.getGetJettonData()).total_supply);
        // console.log((await token.getGetJettonData()).max_supply);
        // console.log((await token.getGetJettonData()).content);
    });

    it("Test: should buy successfully", async () => {
        return;
        const totalSupplyBefore = (await token.getGetJettonData()).total_supply;
        console.log("Total Supply Before Buy: " + fromNano(totalSupplyBefore));
        const buy: Buy = {
            $$type: "Buy",
            ton_value: toNano("0.12"), // 25000000 * 1e9 / 672354948805460750
        };

        const buyResult = await token.send(deployer.getSender(), { value: toNano("0.82") }, buy);
        printTransactionFees(buyResult.transactions);
        expect(buyResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            success: true,
        });

        const totalSupplyAfter = (await token.getGetJettonData()).total_supply;
        console.log("Total Supply After Buy: " + fromNano(totalSupplyAfter));
        // expect(totalSupplyBefore + mintAmount).toEqual(totalSupplyAfter);
        const thisSupply = await token.getThisSupply();
        console.log("This Supply after buy: " + fromNano(thisSupply));

        // const walletData = await jettonWallet.getGetWalletData();
        // expect(walletData.owner).toEqualAddress(deployer.address);
        // console.log("Wallet Balance After Buy: " + fromNano(walletData.balance));
        // expect(walletData.balance).toBeGreaterThanOrEqual(mintAmount);
    });

    it("Test: should buy/sell successfully", async () => {
        return;
        const totalSupplyBefore = (await token.getGetJettonData()).total_supply;
        console.log("Total Supply Before Buy: " + fromNano(totalSupplyBefore));
        let tokenBalanceBefore = (await jettonWallet.getGetWalletData()).balance;
        let tonBalanceBefore = await token.getThisBalance();
        const buyResult = await token.send(deployer.getSender(), { value: toNano("0.3") }, {
            $$type: "Buy",
            ton_value: toNano("0.02"),
        });
        expect(buyResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            success: true,
        });
        printTransactionFees(buyResult.transactions);

        let buyEvent = loadBuyEvent(buyResult.externals[0].body.asSlice());
        console.log("Buy Event: ", buyEvent);
        console.log("   sender: " + buyEvent.sender.toString());
        console.log("   amount: " + fromNano(buyEvent.amount));
        console.log("   token_amount: " + fromNano(buyEvent.tokenAmount));
        console.log("   trade_info: " + buyEvent.tradeInfo);
        console.log("       referrer: " + buyEvent.tradeInfo.referrer.toString());
        console.log("       referrer_amount: " + fromNano(buyEvent.tradeInfo.referrer_amount));
        console.log("       up_referrer:" + buyEvent.tradeInfo.up_referrer.toString());
        console.log("       up_referrer_amount:" + buyEvent.tradeInfo.up_referrer_amount.toString());
        console.log("       fee_value:" + fromNano(buyEvent.tradeInfo.fee_value));
        console.log("       remain_amount:" + fromNano(buyEvent.tradeInfo.remain_amount));

        let tokenBalanceAfter = (await jettonWallet.getGetWalletData()).balance;
        console.log("Token Balance After Buy: " + fromNano(tokenBalanceAfter));
        let buyAmount = tokenBalanceAfter - tokenBalanceBefore;
        console.log("Buy token Amount: " + fromNano(buyAmount));
        // const walletData = await jettonWallet.getGetWalletData();
        // expect(walletData.owner).toEqualAddress(deployer.address);
        // console.log("Wallet Balance After Buy: " + fromNano(walletData.balance));
        // expect(walletData.balance).toBeGreaterThanOrEqual(mintAmount);
        let balanceBeforeSell = await deployer.getBalance();
        console.log("Balance Before Sell: " + fromNano(balanceBeforeSell));
        let sellTimes = 1;
        for (let i = 0; i < sellTimes; i++) {
            const sellResult = await token.send(deployer.getSender(), { value: toNano("0.51") }, {
                $$type: "Sell",
                amount: buyAmount / BigInt(sellTimes),
            });
            expect(sellResult.transactions).toHaveTransaction({
                from: deployer.address,
                to: token.address,
                success: true,
            });
            printTransactionFees(sellResult.transactions);

            prettyLogTransactions(sellResult.transactions);
        }

        let balanceAfterSell = await deployer.getBalance();
        console.log("Balance After Sell: " + fromNano(balanceAfterSell));

        let tokenBalanceAfterSell = (await jettonWallet.getGetWalletData()).balance;
        console.log("Token Balance After Sell: " + fromNano(tokenBalanceAfterSell));

        let tonBalanceAfter = await token.getThisBalance();
        const thisSupplySell = await token.getThisSupply();
        console.log("EPS in BondCurveMEME: ", fromNano(tokenBalanceBefore - tonBalanceAfter));

        console.log("This Supply after Sell: " + fromNano(thisSupplySell));
    });

    const buyBatch = async (n: number, buyer: SandboxContract<TreasuryContract>, jettonWallet: SandboxContract<JettonDefaultWallet>) => {
        const totalSupplyBefore = (await token.getGetJettonData()).total_supply;
        console.log("Total Supply Before Buy: " + fromNano(totalSupplyBefore));
        console.log("balanceOf jettonWallet before buy: " + fromNano((await jettonWallet.getGetWalletData()).balance));

        let totalTonAmount = BigInt(0);
        let totalMemeAmount = BigInt(0);
        let firstPrice = "";
        let lastPrice = "";
        for (let i = 0; i < n; i++) {
            const buyTonValue = toNano("0.02");
            const buy: Buy = {
                $$type: "Buy",
                ton_value: buyTonValue,
            };

            let balanceBefore = (await jettonWallet.getGetWalletData()).balance;
            const buyResult = await token.send(buyer.getSender(), { value: toNano("0.35") + buyTonValue }, buy);
            expect(buyResult.transactions).toHaveTransaction({
                from: buyer.address,
                to: token.address,
                success: true,
            });
            let balanceAfter = (await jettonWallet.getGetWalletData()).balance;
            let buyAmount = balanceAfter - balanceBefore;

            // const sellResult = await token.send(buyer.getSender(), { value: toNano("0.34") + toNano("0.01")  }, {
            //     $$type: "Sell",
            //     amount: buyAmount,
            // });
            // expect(sellResult.transactions).toHaveTransaction({
            //     from: buyer.address,
            //     to: token.address,
            //     success: true,
            // });

            totalTonAmount += buyTonValue;
            totalMemeAmount += buyAmount;
            lastPrice = (toNano(1) * buyTonValue / buyAmount).toString();
            if (i == 0) {
                firstPrice = lastPrice;
            }

            // printTransactionFees(buyResult.transactions);
            if (buyResult.externals.length > 1) {
                console.log("Buy Batch: " + i);
                console.log("finish.");
                break;
            }
        }
        console.log("First Price: " + fromNano(firstPrice));
        console.log("Last Price: " + fromNano(lastPrice));
        console.log("times: " + (BigInt(lastPrice) / BigInt(firstPrice)).toString());
        console.log("Total Ton Amount: " + fromNano(totalTonAmount));
        console.log("Total Meme Amount: " + fromNano(totalMemeAmount));
        console.log("balanceOf jettonWallet: " + fromNano((await jettonWallet.getGetWalletData()).balance));


        const totalSupplyAfter = (await token.getGetJettonData()).total_supply;
        console.log("Total Supply After Buy: " + fromNano(totalSupplyAfter));
        // expect(totalSupplyBefore).toEqual(totalSupplyAfter);
        const thisSupply = await token.getThisSupply();
        console.log("This Supply after buy: " + fromNano(thisSupply));

        // const walletData = await jettonWallet.getGetWalletData();
        // expect(walletData.owner).toEqualAddress(deployer.address);
        // console.log("Wallet Balance After Buy: " + fromNano(walletData.balance));
        // expect(walletData.balance).toBeGreaterThanOrEqual(mintAmount);
    }

    it("Buy batch", async () => {
        // return;
        // await buyBatch(407, deployer, jettonWallet);
    });

    it("Player Buy batch", async () => {
        return;
        await buyBatch(407, player, playerJettonWallet);
    });
});