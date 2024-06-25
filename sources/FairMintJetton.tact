import "@stdlib/stoppable";
import "./jetton";
import "./stonfi";
message TradeStepEvent {
    trade_step: Int as uint8;
}
message FairMint {
    ton_value: Int as coins; // use ton value instead of value
    amount: Int as coins;
    receiver: Address;
}
message FairMintEvent {
    sender: Address;
    amount: Int as coins;
}
struct MintConfig {
    mint_supply: Int as coins; // Total amount when minting publicly
    mint_price: Int as coins; // Price when minting publicly
    single_mint_min: Int as coins; // Minimum amount per mint when minting publicly
    single_mint_max: Int as coins; // Maximum amount per mint when minting publicly
    mint_max: Int as coins; // Maximum amount when minting publicly, not checked, just placeholder
    end_timestamp: Int as uint64; // End time for public minting
    liquidity_price: Int as coins; // Price when adding liquidity
}
struct TradeConfig {
    swap_router: Address;
    target_amount: Int as coins;
    proxy_ton: Address;
    ton_value_add_meme: Int as coins; // ton("0.3")
    ton_value_add_pton: Int as coins; // ton("0.3")
    router_pton_wallet: Address;
}

contract FairMintJetton with Jetton, Resumable {
    total_supply: Int as coins;
    owner: Address; // The Stoppable trait requires you to add this exact state variable
    stopped: Bool; // The Stoppable trait requires you to add this exact state variable
    content: Cell;
    mintable: Bool;
    transferable: Bool;
    max_supply: Int as coins; // Extract parameter we set here. The Jetton Standards doesn't have this parameter.

    mint_config: MintConfig;
    trade_config: TradeConfig;
    protocol_receiver: Address;
    trade_step: Int as uint8; // 0: init, 1: mint, 2: trade, 3: add ton, 4: add meme
    this_balance: Int as coins;
    pool_token_amount: Int as coins;
    backend_bot: Address;
    init(owner: Address,
        content: Cell,
        max_supply: Int,
        mint_config: MintConfig,
        trade_config: TradeConfig,
        protocol_receiver: Address,
        backend_bot: Address){
        self.total_supply = 0;
        self.owner = owner;
        self.stopped = false;
        self.mintable = true;
        self.transferable = false;
        self.content = content;
        self.max_supply = max_supply;
        self.mint_config = mint_config;
        require(trade_config.swap_router != newAddress(0, 0), "swapRouter is zero");
        self.trade_config = trade_config;
        require(protocol_receiver != newAddress(0, 0), "protocolReceiver is zero");
        require(backend_bot != newAddress(0, 0), "backendBot is zero");
        self.protocol_receiver = protocol_receiver;
        self.trade_step = 0;
        self.this_balance = 0;
        self.pool_token_amount = 0;
        self.backend_bot = backend_bot;
        emit(TradeStepEvent{trade_step: 0}.toCell());
    }

    receive("deploy"){}

    receive(){}

    receive(msg: TokenExcesses){}

    receive(msg: FairMint){
        let ctx: Context = context();
        self.requireNotStopped();
        require(self.trade_step == 0, "not fair mint");
        require(msg.amount >= self.mint_config.single_mint_min, "too low");
        require(msg.amount <= self.mint_config.single_mint_max, "too big");
        require(self.mintable, "Not mintable");
        require((self.total_supply + msg.amount) <= self.mint_config.mint_supply, "total exceed mintSupply");
        require(msg.ton_value * ton("1") >= self.mint_config.mint_price * msg.amount, "insufficient pay");
        require(ctx.value >= msg.ton_value, "insufficient pay for gas");
        require(now() <= self.mint_config.end_timestamp, "Expired");
        if (msg.ton_value * 5 / 100 >= ton("0.01")) {
            send(SendParameters{
                    to: self.protocol_receiver,
                    bounce: true,
                    value: msg.ton_value * 5 / 100,
                    mode: SendIgnoreErrors,
                    body: "5% to protocol receiver".asComment()
                }
            );
        }
        self.this_balance += (msg.ton_value - msg.ton_value * 5 / 100);
        self.mint(msg.receiver, msg.amount, self.owner);
        if ((self.total_supply + self.mint_config.single_mint_min) > self.mint_config.mint_supply) {
            self.trade_step = 2;
            emit(TradeStepEvent{trade_step: self.trade_step}.toCell());
            self.pool_token_amount = self.this_balance * ton("1") / self.mint_config.liquidity_price;
            self.mint(myAddress(), self.pool_token_amount, self.owner);
        }
        emit(FairMintEvent{sender: ctx.sender, amount: msg.amount}.toCell());
    }

    receive("createPoolWithExpired"){
        require(self.trade_step == 0, "not fair mint");
        require(now() > self.mint_config.end_timestamp, "not expired");
        self.trade_step = 2;
        emit(TradeStepEvent{trade_step: self.trade_step}.toCell());
        self.pool_token_amount = self.this_balance * ton("1") / self.mint_config.liquidity_price;
        self.mint(myAddress(), self.pool_token_amount, self.owner);
    }

    receive("add_ton_v4"){
        require(self.trade_step == 2 || context().sender == self.backend_bot, "not add ton liquidity");
        self.trade_step = 3;
        emit(TradeStepEvent{trade_step: 3}.toCell());
        self.sendTonToWalletV4(self.this_balance, 1);
    }

    receive("add_meme_v4"){
        require(self.trade_step == 3 || context().sender == self.backend_bot, "not add meme liquidity");
        self.sendMemeToWalletV4(myAddress(), self.trade_config.proxy_ton, self.pool_token_amount, 1);
        self.trade_step = 4;
        emit(TradeStepEvent{trade_step: 4}.toCell());
    }

    receive("transferable") {
        require(context().sender == self.backend_bot, "not backend bot");
        require(self.trade_step == 4, "liquidity not added");
        self.transferable = true;
        self.trade_step = 5;
        emit(TradeStepEvent{trade_step: 5}.toCell());
    }

    receive(msg: DirectAddLiquidity) {
        require(context().sender == self.backend_bot, "not backend bot");
        send(SendParameters{
                to: msg.lp_account,
                bounce: true,
                value: 0,
                mode: SendRemainingValue | SendIgnoreErrors,
                body: beginCell()
                        .storeUint(0x4cf82803, 32) // 0x4cf82803 is directAddLiquidity in ston.fi
                        .storeUint(0, 64) // query_id
                        .storeCoins(msg.amt0)
                        .storeCoins(msg.amt1)
                        .storeCoins(msg.min_lp_out)
                      .endCell()
            }
        );
    }

    receive(msg: JettonTransferNotification) {}

    fun sendMemeToWalletV4(tokenAddr: Address, otherTokenAddr: Address, tokenAmount: Int, minLPOut: Int) {
        let init_a: StateInit = initOf JettonDefaultWallet(myAddress(), myAddress()); // owner, master
        let this_meme_jetton_wallet: Address = contractAddress(init_a);
        let c: Cell = StonfiProvideLiquidity{
            token_wallet: self.trade_config.router_pton_wallet,
            min_lp_out: minLPOut
        }.toCell();
        let forward_cell: Cell = beginCell().storeUint(1, 1).storeRef(c).endCell();
        send(SendParameters{
                to: this_meme_jetton_wallet,
                bounce: true,
                value: self.trade_config.ton_value_add_meme,
                mode: SendIgnoreErrors,
                body: TokenTransfer{
                    query_id: 0,
                    amount: tokenAmount,
                    destination: self.trade_config.swap_router,
                    response_destination: myAddress(),
                    custom_payload: null,
                    forward_ton_amount: ton("0.24"),
                    forward_payload: forward_cell.asSlice()
                }.toCell(),
                code: init_a.code,
                data: init_a.data
            }
        );
    }

    fun sendTonToWalletV4(ton_amount: Int, min_lp_out: Int) {
        let init_b: StateInit = initOf JettonDefaultWallet(self.trade_config.swap_router, myAddress());
        let that_meme_router_wallet: Address = contractAddress(init_b);
        let c: Cell = StonfiProvideLiquidity{token_wallet: that_meme_router_wallet, min_lp_out: min_lp_out}.toCell();
        let forward_cell: Cell = beginCell().storeUint(1, 1).storeRef(c).endCell();
        send(SendParameters{
                to: self.trade_config.router_pton_wallet,
                bounce: false,
                value: 0,
                mode: SendRemainingValue | SendIgnoreErrors,
                body: TokenTransfer {
                    query_id: 0,
                    amount: ton_amount,
                    destination: self.trade_config.swap_router,
                    response_destination: null,
                    custom_payload: null,
                    forward_ton_amount: ton("0.26"),
                    forward_payload: forward_cell.asSlice()
                }.toCell()
            }
        );
    }

    get fun mint_config(): MintConfig {
        return self.mint_config;
    }

    get fun trade_step(): Int {
        return self.trade_step;
    }

    // supply that already minted

    get fun total_supply(): Int {
        return self.total_supply;
    }

    get fun this_balance(): Int {
        return self.this_balance;
    }

    get fun trade_config(): TradeConfig {
        return self.trade_config;
    }

    // receive("Resume") is added automatically to allow owner to resume the contract
    // receive("Stop") is added automatically to allow owner to stop the contract
    // get fun stopped(): Bool is added automatically to query if contract is stopped
    // get fun owner(): Address is added automatically to query who the owner is
}