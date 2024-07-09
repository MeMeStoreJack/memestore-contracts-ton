import "@stdlib/deploy";
import "./jetton";

contract JettonMasterUSDT with Jetton, Deployable {
    total_supply: Int as coins = 0;
    mintable: Bool = true;
    owner: Address;
    content: Cell;
    transferable: Bool = true;
    init(owner: Address, jetton_content: Cell){
        self.owner = owner;
        self.content = jetton_content;
        self.transferable = true;
    }

    receive("deploy"){}

    receive("Mint:1000000"){
        self.mint(sender(), ton("1000000"), sender());
    }
}