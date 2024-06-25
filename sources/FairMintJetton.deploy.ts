import { beginCell, contractAddress, toNano, TonClient4, WalletContractV4, internal, fromNano, Address, Cell } from "@ton/ton";
import { mnemonicToPrivateKey } from "ton-crypto";
import { buildOnchainMetadata } from "./utils/jetton-helpers";

import { FairMintJetton, MintConfig, TradeConfig } from "./output/FairMintJetton_FairMintJetton";
import { JettonDefaultWallet, TokenBurn } from "./output/FairMintJetton_JettonDefaultWallet";

import { printSeparator } from "./utils/print";
import * as dotenv from "dotenv";
import { storeFairMint } from "./output/FairMintJetton_FairMintJetton";
import { storeDirectAddLiquidity } from "./output/BondCurveJetton_BondCurveJetton";
dotenv.config();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type BodyValue = {
    body: string | Cell,
    value: bigint,
}

(async () => {
    //create client for testnet sandboxv4 API - alternative endpoint
    const client4 = new TonClient4({
        // endpoint: "https://sandbox-v4.tonhubapi.com",
        // endpoint: "https://testnet.tonapi.io"
        // endpoint: "https://mainnet-v4.tonhubapi.com",
        endpoint: "https://testnet-v4.tonhubapi.com",
        // endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    });

    let mint_config: MintConfig = {
        $$type: "MintConfig",
        mint_supply: toNano("1"),
        mint_price: toNano("0.01"),
        single_mint_min: toNano("1"),
        single_mint_max: toNano("100"),
        mint_max: toNano("100000"), // 0.72
        end_timestamp: 1000000000000n,
        liquidity_price: toNano("0.01"),
    }
    
    let trade_config: TradeConfig = {
        $$type: "TradeConfig",
        swap_router: Address.parse("EQBsGx9ArADUrREB34W-ghgsCgBShvfUr4Jvlu-0KGc33Rbt"),
        target_amount: toNano("1000"),
        proxy_ton: Address.parse("kQAcOvXSnnOhCdLYc6up2ECYwtNNTzlmOlidBeCs5cFPV7AM"), // testnet proxy ton
        ton_value_add_meme: toNano("0.5"),
        ton_value_add_pton: toNano("0.3"),
        router_pton_wallet: Address.parse("kQCdC2b1GG1saybYxCwRfEqr4WlOexsQIcYcfMYObk_477vs"), // testnet router pton wallet
    }

    let mnemonics = (process.env.mnemonics_2 || "").toString(); // 🔴 Change to your own, by creating .env file!
    console.log(`mnemonics: ${mnemonics}`);
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0; //we are working in basechain.
    let deployer_wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    console.log(deployer_wallet.address);

    let deployer_wallet_contract = client4.open(deployer_wallet);

    const jettonParams = {
        name: "meme",
        description: "meme token on boom.fun",
        symbol: "MEME",
        image: "https://avatars.githubusercontent.com/u/104382459?s=200&v=4",
    };

    // Create content Cell
    let content = buildOnchainMetadata(jettonParams);
    let max_supply = toNano(123456766689011); // 🔴 Set the specific total supply in nano
    let mint_supply = toNano(1000000000000); // 1000 * 1e9

    // Compute init data for deployment
    // NOTICE: the parameters inside the init functions were the input for the contract address
    // which means any changes will change the smart contract address as well
    let init = await FairMintJetton.init(deployer_wallet_contract.address, content, max_supply, mint_config, trade_config, deployer_wallet_contract.address, deployer_wallet_contract.address);
    let jettonMaster = contractAddress(workchain, init);
    let deployAmount = toNano("0.15");
    let fairMintAmount = toNano("0.15");

    let supply = toNano(1000000000); // 🔴 Specify total supply in nano
    let packed_fair_mint_msg = beginCell()
        .store(
            storeFairMint({
                $$type: "FairMint",
                ton_value: toNano("0.01"),
                amount: toNano("1"),
                receiver: deployer_wallet_contract.address,
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
    console.log("Minting:: ", fromNano(supply));
    printSeparator();

    // await deployer_wallet_contract.sendTransfer({
    //     seqno,
    //     secretKey,
    //     messages: [
    //         internal({
    //             to: jettonMaster,
    //             value: deployAmount,
    //             init: {
    //                 code: init.code,
    //                 data: init.data,
    //             },
    //             body: packed_msg,
    //         }),
    //     ],
    // });
    // console.log("====== Deployment message sent to =======\n", jettonMaster);
    let bodies: BodyValue[] = [
        {
            body: packed_fair_mint_msg,
            value: toNano("0.5"),
        },{
            body: "add_ton_v4",
            value: toNano("0.54"),
        }, {
            body: "add_meme_v4",
            value: toNano("0.7"),
        }, {
            body: "transferable",
            value: toNano("0.1"),
        }
    ];

    for (let i = 0; i < bodies.length; i++) {
        await deployer_wallet_contract.sendTransfer({
            seqno: seqno + i,
            secretKey,
            messages: [
                internal({
                    to: jettonMaster,
                    value: bodies[i].value,
                    init: {
                        code: init.code,
                        data: init.data,
                    },
                    body: bodies[i].body,
                }),
            ],
        });
        await sleep(30000);
    }

    console.log("====== fairmint message sent to =======\n", jettonMaster);
})();
