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
import { ReferrerParent, NewReferrer, loadReferrerSetEvent} from "./output/ReferrerParent_ReferrerParent";
import { ReferrerChild} from "./output/ReferrerParent_ReferrerChild";

describe("ReferrerParent", () => {
    let blockchain: Blockchain;
    let referrerParent: SandboxContract<ReferrerParent>;
    let jettonWallet: SandboxContract<ReferrerChild>;
    let deployer: SandboxContract<TreasuryContract>;
    let player: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        // Create content Cell

        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury("deployer");
        player = await blockchain.treasury("player");
        referrerParent = blockchain.openContract(await ReferrerParent.fromInit());

        // Send Transaction
        const deployResult = await referrerParent.send(deployer.getSender(), { value: toNano("0.1") }, "deploy");
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: referrerParent.address,
            deploy: true,
            success: true,
        });
        printTransactionFees(deployResult.transactions);

        // const playerWallet = await token.getGetWalletAddress(deployer.address);
        // jettonWallet = blockchain.openContract(JettonDefaultWallet.fromAddress(playerWallet));
    });

    it("Test: whether contract deployed successfully", async () => {
        // the check is done inside beforeEach, blockchain and token are ready to use
        // console.log((await token.getGetJettonData()).total_supply);
        // console.log((await token.getGetJettonData()).content);
    });

    const dumpAddress = (src: string) => {
        console.log(Address.isAddress(src));
        let {isBounceable, isTestOnly, address} = Address.parseFriendly(src);
        console.log("bounceable: ", isBounceable);
        console.log("testOnly: ", isTestOnly);
        console.log("address: ", address);
        console.log("address workchain:", address.workChain);
        console.log("address hash:", address.hash.toString("hex"));

        console.log("Testnet bounceable: ", address.toString({bounceable: true, testOnly: true}));
        console.log("Testnet non-bounceable: ", address.toString({bounceable: false, testOnly: true}));
        console.log("Mainnet bounceable: ", address.toString({bounceable: true, testOnly: false}));
        console.log("Mainnet non-bounceable: ", address.toString({bounceable: false, testOnly: false}));
    }

    it("Test: Dump address", async () => {
        // dumpAddress("UQBeE6QYHVrtjrCemwUYnGYZFVM9MkJXSwsURWZF13FkcZit")
        // dumpAddress("EQD7ZALptScRcYV6NIADRYVlqaAfGrikUoYtpwVowFwIq2uo")
        dumpAddress("EQBsGx9ArADUrREB34W-ghgsCgBShvfUr4Jvlu-0KGc33Rbt"); // kQBsGx9ArADUrREB34W-ghgsCgBShvfUr4Jvlu-0KGc33a1n stonfi_router
        // dumpAddress("kQBeE6QYHVrtjrCemwUYnGYZFVM9MkJXSwsURWZF13FkcX7i")
    });

    it("Test: should set/get referrer succeess", async () => {
        let newReferrer: NewReferrer = {
            $$type: "NewReferrer",
            // referrer: player.address,
            referrer: Address.parse("kQD7ZALptScRcYV6NIADRYVlqaAfGrikUoYtpwVowFwIq9Ai")
        };
        const setResult = await referrerParent.send(deployer.getSender(), { value: toNano("0.1") }, newReferrer);
        expect(setResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: referrerParent.address,
            success: true,
        });
        setResult.externals.map((external) => {
            let rse = loadReferrerSetEvent(external.body.asSlice());
            expect(rse.$$type).toEqual("ReferrerSetEvent");
            expect(rse.referrer).toEqualAddress(newReferrer.referrer);
            expect(rse.owner).toEqualAddress(deployer.address);
        });

        printTransactionFees(setResult.transactions);
    });
});