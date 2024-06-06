import {
    WalletContractV4,
    beginCell,
    Address,
    contractAddress,
    ContractProvider,
    TonClient4,
    TonClient,
    fromNano,
    toNano,
    Cell,
    BitString,
    Slice,
} from "@ton/ton";
import { mnemonicToPrivateKey } from "ton-crypto";

import { BondCurveJetton } from "./output/BondCurveJetton_BondCurveJetton";
import { JettonDefaultWallet } from "./output/BondCurveJetton_JettonDefaultWallet";

(async () => {
    const client = new TonClient4({
        endpoint: "https://testnet-v4.tonhubapi.com",
    });
    const mnemonics = process.env.mnemonics_2 || "";
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0; //we are working in basechain.
    let deploy_wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    let deploy_wallet_contract = client.open(deploy_wallet);
    let balance: bigint = await deploy_wallet_contract.getBalance();
    console.log("deploy wallet balance in nano ton: " + balance);
    console.log("deploy wallet balance in Ton: " + fromNano(balance));

    let bond_curve_contract_address = "kQADonXe1GRJ7UX3hl3Ql80XARitTxrStrywwZsDGF9v3e1U";
    console.log("Jetton Master: " + bond_curve_contract_address);
    let bond_curve_contract = client.open(BondCurveJetton.fromAddress(Address.parse(bond_curve_contract_address)));
    console.log("boud curve contract: ", bond_curve_contract.address);
    console.log("bond curve owner: ", await bond_curve_contract.getOwner());
    console.log("bond curve this balance: ", await bond_curve_contract.getThisBalance());
    console.log("bond curve this supply: ", await bond_curve_contract.getThisSupply());
})();