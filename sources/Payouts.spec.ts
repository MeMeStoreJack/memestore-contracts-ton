import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees } from "@ton/sandbox";
import "@ton/test-utils";
import { Address, beginCell, fromNano, StateInit, toNano } from "@ton/core";
import { TonClient4 } from "@ton/ton";
import { printSeparator } from "./utils/print";

import { PayoutsMaster} from "./output/Payouts_PayoutsMaster";
import { PayoutBeacon } from "./output/Payouts_PayoutBeacon";

describe("Payouts", () => {
    let blockchain: Blockchain;
    let payouts: SandboxContract<PayoutsMaster>;
    let beaconWallet: SandboxContract<PayoutBeacon>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury("deployer");
        // let pubkey = 1n;
        let owner = deployer.address;
        let pubkey = 1n;
        payouts = blockchain.openContract(await PayoutsMaster.fromInit(owner, pubkey))

        const deployResult = await payouts.send(deployer.getSender(), { value: toNano("1") }, "deploy");
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: payouts.address,
            deploy: true,
            success: true,
        });
    });

    it("Test: should deply ok", async () => {
        console.log("Payouts address: ", payouts.address.toString());
        console.log("Payouts owner: ", await payouts.getOwner());
    });
});
    