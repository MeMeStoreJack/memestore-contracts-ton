import "@stdlib/deploy";
import "@stdlib/ownable";
import "@stdlib/stoppable";

message TryPayout {
    address: Address;
    value: Int as coins;
    nonce: Int as uint64;
    payout_id: Int as uint64;
}

message PayoutOk {
    address: Address;
    value: Int as coins;
    nonce: Int as uint64;
    payout_id: Int as uint64;
}

message PayoutFailed {
    address: Address;
    value: Int as coins;
    nonce: Int as uint64;
    payout_id: Int as uint64;
}

message EventPayoutCompleted {
    address: Address;
    value: Int as coins;
    nonce: Int as uint64;
    payout_id: Int as uint64;
}

contract PayoutBeacon with Ownable, Deployable {
    override const storageReserve: Int = ton("0.1");

    owner: Address;
    master: Address;
    nonce: Int as uint64;

    init(owner: Address, master: Address) {
        self.owner = owner;
        self.master = master;
        self.nonce = 0;
    }

    receive(msg: TryPayout) {
        let ctx: Context = context();
        require(ctx.sender == self.master, "Invalid sender");
        if (msg.nonce == self.nonce) {
            self.nonce += 1;
            self.forward(ctx.sender, PayoutOk{ value: msg.value, address: self.owner, nonce: msg.nonce, payout_id: msg.payout_id }.toCell(), true, null);
        } else {
            self.forward(ctx.sender, PayoutFailed{ value: msg.value, address: self.owner, nonce: msg.nonce, payout_id: msg.payout_id }.toCell(), false, null);
        }
    }

    bounced(msg: bounced<PayoutOk>) {
        // Reset nonce if our message bounced
        self.nonce -= 1;
        self.forward(self.owner, "Payout failed".asComment(), false, null);
    }

    get fun master(): Address {
        return self.master;
    }

    get fun nonce(): Int {
        return self.nonce;
    }
}

contract PayoutsMaster with Deployable, Ownable, Resumable {
    override const storageReserve: Int = ton("0.1");
    const withdrawMinValue: Int = ton("0.001");

    owner: Address;
    publicKey: Int as uint256;
    stopped: Bool;

    init(owner: Address, publicKey: Int) {
        self.owner = owner;
        self.publicKey = publicKey;
        self.stopped = false;
    }

    receive(){}
    receive("deploy"){}

    //
    // Payout operations
    //

    receive(withdraw: String) {
        // Normalize
        withdraw = normalizeKey(withdraw);

        self.requireNotStopped();
        let ctx: Context = context();
        require(ctx.value >= ton("1.0"), "Invalid value");

        // Parse the withdraw message
        let msg: Slice = withdraw.fromBase64();
        let signature: Slice = msg.loadBits(512);
        let value: Int = msg.loadCoins();
        let nonce: Int = msg.loadUint(64);
        let expire: Int = msg.loadUint(64);
        let payout_id: Int = msg.loadUint(64);
        require(expire >= now(), "Expired signature");

        // Verify the signature
        let sigCell: Cell = beginCell()
            .storeAddress(ctx.sender)
            .storeCoins(value)
            .storeUint(nonce, 64)
            .storeUint(expire, 64)
            .storeUint(payout_id, 64)
            .endCell();
        let hash: Int = sigCell.hash();
        require(checkSignature(hash, signature, self.publicKey), "Invalid signature");

        // Check min value
        require(value >= self.withdrawMinValue, "Check withdraw min value");

        // Check balance before sending forward to save some gas on depletion
        require(myBalance() > ton("1.0") + self.storageReserve + value, "Insufficient balance on master");

        // Send message to beacon
        let init: StateInit = initOf PayoutBeacon(ctx.sender, myAddress());
        let address: Address = contractAddress(init);
        self.forward(address, TryPayout{ address: ctx.sender, value: value, nonce: nonce, payout_id: payout_id }.toCell(), true, init);
    }

    receive(ok: PayoutOk) {
        self.requireNotStopped();

        let init: StateInit = initOf PayoutBeacon(ok.address, myAddress());
        let beaconAddress: Address = contractAddress(init);
        require(context().sender == beaconAddress, "Invalid sender");

        // Require required balance
        require(myBalance() > ton("1.0") + self.storageReserve + ok.value, "Insufficient balance on master");

        // Emit event
        emit(EventPayoutCompleted{ address: ok.address, value: ok.value, nonce: ok.nonce, payout_id: ok.payout_id }.toCell());

        // Send the payout
        send(SendParameters{
            value: ok.value, 
            mode: SendRemainingValue,
            to: ok.address, 
            body: "Payout сompleted".asComment()
        });
    }

    receive(failed: PayoutFailed) {
        send(SendParameters{
            value: 0, 
            mode: SendRemainingValue,
            to: failed.address, 
            body: "Already paid".asComment()
        });
    }

    //
    // Admin operations
    //

    receive("Deposit") {
        // NOTE: This method is allowed for anyone
        let ctx: Context = context();
        require(ctx.value >= ton("1.0"), "Invalid value");
        send(SendParameters{
            value: ton("0.1"), 
            mode: SendIgnoreErrors,
            to: ctx.sender, 
            bounce: false,
            body: "Deposit received".asComment()
        });
    }

    receive("Withdraw") {
        self.requireOwner();
        nativeReserve(self.storageReserve, 0);
        send(SendParameters{
            value: 0, 
            mode: SendRemainingBalance,
            to: self.owner, 
            bounce: false,
            body: "Withdraw completed".asComment()
        });
    }

    receive("Destroy") {
        self.requireOwner();
        send(SendParameters{
            value: 0, 
            mode: SendRemainingBalance + SendDestroyIfZero,
            to: self.owner, 
            bounce: false,
            body: "Contract destroyed".asComment()
        });
    }

    // Getters

    get fun publicKey(): Int {
        return self.publicKey;
    }
}

fun normalizeKey(src: String): String {
    let out: Builder = beginCell();
    let slice: Slice = src.asSlice();
    while(slice.bits() > 0 || slice.refs() > 0) {
        require(slice.bits() % 8 == 0 && slice.refs() <= 1, "Invalid string");
        if (slice.bits() > 0) {
            let ch: Int = slice.loadUint(8);
            if (ch >= 33 && ch <= 126) {
                out = out.storeUint(ch, 8);
            }
        } else {
            slice = slice.loadRef().beginParse();
        }
    }
    return out.asSlice().asString();
}