import "@stdlib/deploy";
import "@stdlib/ownable";
import "@stdlib/stoppable";
message TryPayout {
    address: Address;
    value: Int as uint64;
    nonce: Int as uint32;
    payout_id: Int as uint32;
    jetton_wallet: Address;
}
message PayoutOk {
    address: Address;
    value: Int as uint64;
    nonce: Int as uint32;
    payout_id: Int as uint32;
    jetton_wallet: Address;
}
message PayoutFailed {
    address: Address;
    value: Int as uint64;
    nonce: Int as uint32;
    payout_id: Int as uint32;
    jetton_wallet: Address;
}
message EventPayoutCompleted {
    address: Address;
    value: Int as uint64;
    nonce: Int as uint32;
    payout_id: Int as uint32;
    jetton_wallet: Address;
}
message WithdrawTicketContent {
    address: Address;
    value: Int as uint64;
    nonce: Int as uint32;
    expire: Int as uint32;
    payout_id: Int as uint32;
    jetton_wallet: Address;
}
message WithdrawTicket {
    ticket: WithdrawTicketContent;
    signature: Slice;
}
message InitJettonWallet {
    jetton_wallet: Address;
}
// transfer#0f8a7ea5 query_id:uint64 amount:(VarUInteger 16) destination:MsgAddress
//                  response_destination:MsgAddress custom_payload:(Maybe ^Cell)
//                  forward_ton_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell)
//                  = InternalMsgBody;
message(0xf8a7ea5) TokenTransfer {
    query_id: Int as uint64; // arbitrary request number.
    amount: Int as coins; // amount of transferred jettons in elementary units.
    destination: Address; // address of the new owner of the jettons.
    response_destination: Address?; // address where to send a response with confirmation of a successful transfer and the rest of the incoming message Toncoins.
    custom_payload: Cell?; // optional custom data (which is used by either sender or receiver jetton wallet for inner logic).
    forward_ton_amount: Int as coins; // the amount of nanotons to be sent to the destination address.
    forward_payload: Slice as remaining; // optional custom data that should be sent to the destination address.
}
message SetPublicKey {
    public_key: Int as uint256;
}

contract PayoutBeacon with Ownable, Deployable {
    override const storageReserve: Int = ton("0.1");
    owner: Address;
    master: Address;
    nonce: Int as uint32;
    init(owner: Address, master: Address){
        self.owner = owner;
        self.master = master;
        self.nonce = 0;
    }

    receive(msg: TryPayout){
        let ctx: Context = context();
        require(ctx.sender == self.master, "Invalid sender");
        if (msg.nonce == self.nonce) {
            self.nonce += 1;
            self.forward(ctx.sender,
                PayoutOk{
                    value: msg.value,
                    address: self.owner,
                    nonce: msg.nonce,
                    payout_id: msg.payout_id,
                    jetton_wallet: msg.jetton_wallet
                }.toCell(),
                true,
                null
            );
        } else {
            self.forward(ctx.sender,
                PayoutFailed{
                    value: msg.value,
                    address: self.owner,
                    nonce: msg.nonce,
                    payout_id: msg.payout_id,
                    jetton_wallet: msg.jetton_wallet
                }.toCell(),
                false,
                null
            );
        }
    }

    bounced(msg: bounced<PayoutOk>){
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

contract JettonPayoutsMaster with Deployable, Ownable, Resumable {
    override const storageReserve: Int = ton("0.1");
    const withdrawMinValue: Int = ton("0");
    owner: Address;
    publicKey: Int as uint256;
    stopped: Bool;
    jettonMaster: Address;
    thisJettonWallet: Address; // set by owner after init

    init(owner: Address, publicKey: Int, jettonMaster: Address){
        self.owner = owner;
        self.publicKey = publicKey;
        self.stopped = false;
        self.jettonMaster = jettonMaster;
        self.thisJettonWallet = newAddress(0, 0);
    }

    receive(){}

    receive("deploy"){}

    receive(msg: InitJettonWallet){
        require(sender() == self.owner, "Only owner can init this jetton wallet");
        require(msg.jetton_wallet != newAddress(0, 0), "Invalid jetton wallet address");
        self.thisJettonWallet = msg.jetton_wallet;
    }

    //
    // Payout operations
    //
    receive(msg: WithdrawTicket){
        self.requireNotStopped();
        let ctx: Context = context();
        require(ctx.value >= ton("0.5"), "Invalid value");
        let ticket_hash: Int = msg.ticket.toCell().hash();
        require(msg.ticket.expire >= now(), "Expired");
        let ok: Bool = checkSignature(ticket_hash, msg.signature, self.publicKey);
        require(ok, "Invalid withdraw signature");
        let init: StateInit = initOf PayoutBeacon(ctx.sender, myAddress());
        let address: Address = contractAddress(init);
        self.forward(address,
            TryPayout{
                address: ctx.sender,
                value: msg.ticket.value,
                nonce: msg.ticket.nonce,
                payout_id: msg.ticket.payout_id,
                jetton_wallet: msg.ticket.jetton_wallet
            }.toCell(),
            true,
            init
        );
    }

    receive(ok: PayoutOk){
        self.requireNotStopped();
        let init: StateInit = initOf PayoutBeacon(ok.address, myAddress());
        let beaconAddress: Address = contractAddress(init);
        require(context().sender == beaconAddress, "Invalid sender");
        // Require required balance
        // require(myBalance() > ton("1.0") + self.storageReserve + ok.value, "Insufficient balance on master");

        // Emit event
        emit(EventPayoutCompleted{
                address: ok.address,
                value: ok.value,
                nonce: ok.nonce,
                payout_id: ok.payout_id,
                jetton_wallet: ok.jetton_wallet
            }.toCell()
        );
        send(SendParameters{
                value: 0,
                mode: SendRemainingValue,
                to: self.thisJettonWallet,
                bounce: true,
                body: TokenTransfer{
                    query_id: ok.payout_id,
                    amount: ok.value,
                    destination: ok.address,
                    response_destination: ok.address,
                    custom_payload: null,
                    forward_ton_amount: 0,
                    forward_payload: beginCell().endCell().asSlice()
                }.toCell()
            }
        );
    }

    receive(failed: PayoutFailed){
        send(SendParameters{value: 0, mode: SendRemainingValue, to: failed.address, body: "Already paid".asComment()});
    }

    //
    // Admin operations
    //

    receive("Deposit"){
        // NOTE: This method is allowed for anyone
        let ctx: Context = context();
        require(ctx.value >= ton("1.0"), "Invalid value");
        send(SendParameters{
                value: ton("0.1"),
                mode: SendIgnoreErrors,
                to: ctx.sender,
                bounce: false,
                body: "Deposit received".asComment()
            }
        );
    }

    receive("Withdraw"){
        self.requireOwner();
        nativeReserve(self.storageReserve, 0);
        send(SendParameters{
                value: 0,
                mode: SendRemainingBalance,
                to: self.owner,
                bounce: false,
                body: "Withdraw completed".asComment()
            }
        );
    }

    receive("Destroy"){
        self.requireOwner();
        send(SendParameters{
                value: 0,
                mode: (SendRemainingBalance + SendDestroyIfZero),
                to: self.owner,
                bounce: false,
                body: "Contract destroyed".asComment()
            }
        );
    }

    receive(msg: SetPublicKey){
        self.requireOwner();
        self.publicKey = msg.public_key;
    }

    // Getters

    get fun publicKey(): Int {
        return self.publicKey;
    }

    get fun jettonMaster(): Address {
        return self.jettonMaster;
    }

    get fun thisJettonWallet(): Address {
        return self.thisJettonWallet;
    }

    get fun get_wallet_address(owner: Address): Address {
        return contractAddress(initOf PayoutBeacon(owner, myAddress()));
    }
}