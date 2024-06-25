import { beginCell, contractAddress, toNano, TonClient4, WalletContractV4, internal, fromNano, Address } from "@ton/ton";
import { mnemonicToPrivateKey } from "ton-crypto";
import { buildOnchainMetadata } from "./utils/jetton-helpers";

import { BondCurveJetton, TradeConfig, storeBuy, storeInitialize, storeSell, storeSetTradeConfig, storeTradeConfig } from "./output/BondCurveJetton_BondCurveJetton";
import { JettonDefaultWallet, TokenBurn } from "./output/BondCurveJetton_JettonDefaultWallet";

import { printSeparator } from "./utils/print";
import * as dotenv from "dotenv";
dotenv.config();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


(async () => {
    //create client for testnet sandboxv4 API - alternative endpoint
    const client4 = new TonClient4({
        endpoint: "https://mainnet-v4.tonhubapi.com",
        timeout: 20_000_000,
    });

    let trade_config: TradeConfig = {
        $$type: "TradeConfig",
        proxy_ton: Address.parse("EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez"), // mainnet proxy ton
        swap_router: Address.parse("EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt"),
        target_amount: toNano("0.02"),
        trade_a: toNano("10"),
        ton_value_add_meme: toNano("0.4"),
        ton_value_add_pton: toNano("0.4"),
        trade_fee_percent: 10n, // 10 / 1000
        referrer_percent: 3n, // 3 / 1000
        up_referrer_percent: 2n, // 2 / 1000
        router_pton_wallet: Address.parse("EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"), // mainnet router pton wallet
    }

    let mnemonics = (process.env.mnemonics_3 || "").toString(); // 🔴 Change to your own, by creating .env file!
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0; //we are working in basechain.
    let deployer_wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    console.log(deployer_wallet.address);

    let deployer_wallet_contract = client4.open(deployer_wallet);

    const jettonParams = {
        name: "BondCurveMEME",
        description: "bond curve meme jetton on boom.fun",
        symbol: "BCMEME",
        image: "https://play-lh.googleusercontent.com/ahJtMe0vfOlAu1XJVQ6rcaGrQBgtrEZQefHy7SXB7jpijKhu1Kkox90XDuH8RmcBOXNn",
    };
    // Create content Cell
    let content = buildOnchainMetadata(jettonParams);
    let max_supply = toNano(123456766689011); // 🔴 Set the specific total supply in nano
    let mint_supply = toNano(1000000000000); // 1000 * 1e9

    // Compute init data for deployment
    // NOTICE: the parameters inside the init functions were the input for the contract address
    // which means any changes will change the smart contract address as well
    let init = await BondCurveJetton.init(deployer_wallet_contract.address, content, max_supply, trade_config, deployer_wallet_contract.address, deployer_wallet_contract.address, deployer_wallet_contract.address, deployer_wallet_contract.address);
    let jettonMaster = contractAddress(workchain, init);
    // let deployAmount = toNano("0.3");
    // let deployAmount = toNano("0.82");
    // let deployAmounts = [toNano("0.3"), toNano("0.3"), toNano("0.3"), toNano("0.3")];
    // let deployAmounts = [toNano("0.3"), toNano("0.3"), toNano("0.5")];
    let deployAmounts = [toNano("0.3"), toNano("0.5")];

    let supply = toNano(1000000000); // 🔴 Specify total supply in nano
    let packed_msg = beginCell()
        .store(
            storeInitialize({
                $$type: "Initialize",
                this_supply: 1_000_000_000_000_000_000n,
                buy_ton_value: 0n,
                max_buy_percent: 0n,
            })
        )
        .endCell();
    
    let packed_buy_msg = beginCell()
        .store(
            storeBuy({
                $$type: "Buy",
                ton_value: toNano("0.12"),
            })
        )
        .endCell();
    let packed_sell_msg = beginCell()
        .store(
            storeSell({
                $$type: "Sell",
                amount: toNano("10000000"),
            })
        )
        .endCell();
    let packed_set_trade_config = beginCell().store(storeSetTradeConfig({
        $$type: "SetTradeConfig",
        trade_config: trade_config,
    })).endCell();

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
    //     seqno: seqno,
    //     secretKey,
    //     messages: [
    //         internal({
    //             to: jettonMaster,
    //             value: toNano("0.1"),
    //             init: {
    //                 code: init.code,
    //                 data: init.data,
    //             },
    //             body: packed_set_trade_config,
    //         }),
    //     ],
    // });

    let bodies = [packed_msg, "add_ton_v4"];
    // let bodies = ["add_meme_v4"];

    for (let i = 0; i < bodies.length; i++) {
        await deployer_wallet_contract.sendTransfer({
            seqno: seqno + i,
            secretKey,
            messages: [
                internal({
                    to: jettonMaster,
                    value: deployAmounts[i],
                    init: {
                        code: init.code,
                        data: init.data,
                    },
                    body: bodies[i],
                }),
            ],
        });
        await sleep(30000);
    }
})();
