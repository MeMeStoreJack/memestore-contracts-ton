import { buildOnchainMetadata } from "./utils/jetton-helpers";
import {
    Blockchain,
    SandboxContract,
    TreasuryContract,
    printTransactionFees,
} from "@ton/sandbox";
import "@ton/test-utils";
import { fromNano, toNano } from "@ton/core";
import { printSeparator } from "./utils/print";

// -------- Contract SDK --------
import { JettonMasterUSDT } from "./output/JettonUSDT_JettonMasterUSDT";
import { JettonDefaultWallet } from "./output/JettonUSDT_JettonDefaultWallet";

const jettonParams = {
    name: "USDT",
    description: "Test USDT",
    symbol: "USDT",
    image: "https://play-lh.googleusercontent.com/ahJtMe0vfOlAu1XJVQ6rcaGrQBgtrEZQefHy7SXB7jpijKhu1Kkox90XDuH8RmcBOXNn",
};
let content = buildOnchainMetadata(jettonParams);
// describe("JettonUSDT", () => {
//     let blockchain: Blockchain;
//     let token: SandboxContract<JettonMasterUSDT>;
//     let jettonWallet: SandboxContract<JettonDefaultWallet>;
//     let deployer: SandboxContract<TreasuryContract>;

//     beforeAll(async () => {
//         blockchain = await Blockchain.create();
//         deployer = await blockchain.treasury("deployer");

//         token = blockchain.openContract(await JettonMasterUSDT.fromInit(deployer.address, content));

//         const deployResult = await token.send(deployer.getSender(), { value: toNano("0.3") }, "deploy");
//         expect(deployResult.transactions).toHaveTransaction({
//             from: deployer.address,
//             to: token.address,
//             deploy: true,
//             success: true,
//         });

//         const playerWallet = await token.getGetWalletAddress(deployer.address);
//         jettonWallet = blockchain.openContract(JettonDefaultWallet.fromAddress(playerWallet));
//     });

//     it("Test: whether contract deployed successfully", async () => {
//         console.log((await token.getGetJettonData()).owner);
//     });

//     it("Test: should Mint:1000000 successfully", async () => {
//         const totalSupplyBefore = (await token.getGetJettonData()).total_supply;
//         console.log("Total Supply Before: " + fromNano(totalSupplyBefore));
//         const mintResult = await token.send(deployer.getSender(), { value: toNano("0.3") }, "Mint:1000000");
//         expect(mintResult.transactions).toHaveTransaction({
//             from: deployer.address,
//             to: token.address,
//             success: true,
//         });
//         let mintAmount = toNano("1000000");
//         printTransactionFees(mintResult.transactions);
//         printSeparator();

//         const totalSupplyAfter = (await token.getGetJettonData()).total_supply;
//         console.log("Total Supply After: " + fromNano(totalSupplyAfter));
//         expect(totalSupplyBefore + mintAmount).toEqual(totalSupplyAfter);

//         const walletData = await jettonWallet.getGetWalletData();
//         expect(walletData.owner).toEqualAddress(deployer.address);
//         console.log("Wallet Balance: " + fromNano(walletData.balance));
//         expect(walletData.balance).toBeGreaterThanOrEqual(mintAmount);
//     });
// });

export {
    jettonParams,
    content
};
