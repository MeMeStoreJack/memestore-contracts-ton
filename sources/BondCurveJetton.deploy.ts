import { beginCell, contractAddress, toNano, TonClient4, WalletContractV4, internal, fromNano, Address } from "@ton/ton";
import { mnemonicToPrivateKey } from "ton-crypto";
import { buildOnchainMetadata } from "./utils/jetton-helpers";

import { BondCurveJetton, TradeConfig, storeBuy, storeInitialize, storeSell } from "./output/BondCurveJetton_BondCurveJetton";
import { JettonDefaultWallet, TokenBurn } from "./output/BondCurveJetton_JettonDefaultWallet";

import { printSeparator } from "./utils/print";
import * as dotenv from "dotenv";
dotenv.config();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


(async () => {
    //create client for testnet sandboxv4 API - alternative endpoint
    const client4 = new TonClient4({
        endpoint: "https://testnet-v4.tonhubapi.com",
        // endpoint: "https://mainnet-v4.tonhubapi.com",
    });

    let trade_config: TradeConfig = {
        $$type: "TradeConfig",
        proxy_ton: Address.parse("kQAcOvXSnnOhCdLYc6up2ECYwtNNTzlmOlidBeCs5cFPV7AM"), // testnet proxy ton
        swap_router: Address.parse("EQBsGx9ArADUrREB34W-ghgsCgBShvfUr4Jvlu-0KGc33Rbt"),
        target_amount: toNano("4"),
        trade_a: toNano("1.6"),
        ton_value_add_meme: toNano("0.3"),
        ton_value_add_pton: toNano("0.3"),
        trade_fee_percent: 10n, // 10 / 1000
        referrer_percent: 3n, // 3 / 1000
        up_referrer_percent: 2n, // 2 / 1000
        router_pton_wallet: Address.parse("EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC"), // mainnet router pton wallet
    }

    let mnemonics = (process.env.mnemonics_2 || "").toString(); // 🔴 Change to your own, by creating .env file!
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
    let init = await BondCurveJetton.init(deployer_wallet_contract.address, content, max_supply, trade_config, deployer_wallet_contract.address, deployer_wallet_contract.address, deployer_wallet_contract.address);
    let jettonMaster = contractAddress(workchain, init);

    let supply = toNano(1000000000); // 🔴 Specify total supply in nano
    let packed_msg = beginCell()
        .store(
            storeInitialize({
                $$type: "Initialize",
                this_supply: 1_000_000_000_000_000_000n,
                buy_ton_value: toNano("0.02"),
                max_buy_percent: 50n,
            })
        )
        .endCell();
    
    let packed_buy_msg = beginCell()
        .store(
            storeBuy({
                $$type: "Buy",
                ton_value: toNano("0.02"),
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

    // send a message on new address contract to deploy it
    let seqno: number = await deployer_wallet_contract.getSeqno();
    console.log("🛠️Preparing new outgoing massage from deployment wallet. \n" + deployer_wallet_contract.address);
    console.log("Seqno: ", seqno + "\n");
    printSeparator();

    // Get deployment wallet balance
    let balance: bigint = await deployer_wallet_contract.getBalance();

    console.log("Current deployment wallet balance = ", fromNano(balance).toString(), "💎TON");
    printSeparator();

    let bodies = [packed_msg, packed_buy_msg, packed_sell_msg];
    let deployAmounts = [toNano("0.52"), toNano("0.51"), toNano("0.51")]
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
