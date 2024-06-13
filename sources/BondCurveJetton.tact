import "@stdlib/stoppable";
import "./jetton";
import "./stonfi";

message TradeStepEvent {
    trade_step: Int as uint256;
}

message BuyEvent {
    sender: Address;
    amount: Int as coins;
    tokenAmount: Int as coins;
    lastTokenPrice: Int as coins;
    tradeInfo: TradeInfo;
}

message SellEvent {
    sender: Address;
    amount: Int as coins;
    tokenAmount: Int as coins;
    lastTokenPrice: Int as coins;
    tradeInfo: TradeInfo;
}

message Buy {
    ton_value: Int as coins; // ton value
}

// user_wallet_v4r2->Master
message Sell {
    amount: Int as coins;
}


struct TradeConfig {
    proxy_ton: Address;
    swap_router: Address;
    target_amount: Int as coins;
    trade_a: Int as coins;
    ton_value_add_meme: Int as coins; // ton("0.3")
    ton_value_add_pton: Int as coins; // ton("0.3")
    trade_fee_percent: Int as uint16; // 1%
    referrer_percent: Int as uint16; // 0.3%
    up_referrer_percent: Int as uint16; // 0.2%
    router_pton_wallet: Address;
}
struct TradeInfo {
    referrer: Address;
    referrer_amount: Int as coins;
    up_referrer: Address;
    up_referrer_amount: Int as coins;
    fee_value: Int as coins;
    remain_amount: Int as coins;
}

message SetTradeConfig {
    trade_config: TradeConfig;
}

message Initialize {
    this_supply: Int as coins;
    buy_ton_value: Int as coins; // ton value for first buy when init
    max_buy_percent: Int as uint16;
}

contract BondCurveJetton with Jetton, Resumable {
    total_supply: Int as coins;
    this_supply: Int as coins;
    this_balance: Int as coins;
    owner: Address; // The Stoppable trait requires you to add this exact state variable
    stopped: Bool;  // The Stoppable trait requires you to add this exact state variable
    content: Cell;
    mintable: Bool;
    max_supply: Int as coins; // Extract parameter we set here. The Jetton Standards doesn't have this parameter.
    issuer: Address; // meme token issuer

    trade_config: TradeConfig;
    trade_fee_receiver: Address;
    protocol_receiver: Address;
    trade_step: Int as uint8; // 0: init, 1: mint, 2: trade, 3: add ton liquidity, 4: add meme liquidity
    initialized: Bool;
    pool_liquidity: Int as coins; // ton liquididy to be added in ston.fi
    pool_token_amount: Int as coins; // meme liquidity to be added in ston.fi

    init(owner: Address,
        content: Cell,
        max_supply: Int,
        trade_config: TradeConfig,
        trade_fee_receiver: Address,
        protocol_receiver: Address,
        issuer: Address){
        self.total_supply = 0;
        self.this_supply = 0;
        self.this_balance = 0;
        self.owner = owner;
        self.stopped = false;
        self.mintable = true;
        self.content = content;
        self.max_supply = max_supply;

        require(trade_config.swap_router != newAddress(0, 0), "swapRouter is zero");
        require(trade_config.router_pton_wallet != newAddress(0, 0), "routerPtonWallet is zero");
        self.trade_config = trade_config;
        require(trade_fee_receiver != newAddress(0, 0), "tradeFeeReceiver is zero");
        require(protocol_receiver != newAddress(0, 0), "protocolReceiver is zero");
        require(issuer != newAddress(0, 0), "issuer is zero");
        self.trade_fee_receiver = trade_fee_receiver;
        self.protocol_receiver = protocol_receiver;
        self.trade_step = 1;
        self.initialized = false;
        self.issuer = issuer;
        self.pool_liquidity = 0;
        self.pool_token_amount = 0;
        emit(TradeStepEvent{trade_step: 1}.toCell());
    }

    receive("deploy"){}

    receive(){}

    receive(msg: TokenExcesses){}

    receive(msg: Initialize) {
        self.initialize(msg);
    }

    fun initialize(msg: Initialize){
        require(sender() == self.owner && !self.initialized, "only owner can initialize");
        self.mint(myAddress(), msg.this_supply, self.owner); // (to, amount, response_destination)
        self.this_supply = msg.this_supply;
        self.initialized = true;
        emit(TradeStepEvent{trade_step: self.trade_step}.toCell());
        if (msg.buy_ton_value > 0) {
            require(context().value >= msg.buy_ton_value + ton("0.5"), "insufficient pay for gas");
            require(msg.max_buy_percent <= 1000, "percent must be <= 1000");
            require(msg.buy_ton_value * 1000 <= self.trade_config.target_amount * msg.max_buy_percent, "exceed max percent"); // buy_ton_value / target_amount <= max_buy_percent / 1000
            self.buy(Buy{ton_value: msg.buy_ton_value}, self.issuer);
        }
    }

    receive("init_jetton_wallet") {
        self.mint(sender(), 0, sender());
    }

    receive(msg: Buy){
        self.buy(msg, sender());
    }

    fun buy(msg: Buy, sender: Address){
        self.requireNotStopped();
        let ctx: Context = context();
        require(self.trade_step == 1, "not trade");
        require(ctx.value >= msg.ton_value, "insufficient pay for gas");
        require(msg.ton_value > 0, "value is zero");
        let trade_info: TradeInfo = self.split_fee(msg.ton_value);
        let token_amount: Int = self.get_amount_out(trade_info.remain_amount, true, self.this_balance, self.this_supply);
        require(token_amount <= self.this_supply, "Insufficient token balance");

        send(SendParameters{
            to: self.trade_fee_receiver,
            bounce: true,
            value: trade_info.fee_value + trade_info.referrer_amount + trade_info.up_referrer_amount + ton("0.01"),
            mode:  SendIgnoreErrors,
            body: "trade+referrer fee".asComment()
        });

        self.this_balance += trade_info.remain_amount;
        let last_token_price: Int = (msg.ton_value * ton("1")) / token_amount;
        // Transfer from the master's jetton wallet to the buyer
        let init: StateInit = initOf JettonDefaultWallet(myAddress(), myAddress());
        send(SendParameters{
            to: contractAddress(init),
            bounce: true,
            value: ton("0.2"),
            mode:  SendIgnoreErrors,
            body: TokenTransfer{
                query_id: 0,
                amount: token_amount,
                destination: sender,
                response_destination: sender,
                custom_payload: null,
                forward_ton_amount: 0,
                forward_payload: beginCell().endCell().asSlice()
            }.toCell(),
            code: init.code,
            data: init.data
        });

        self.this_supply -= token_amount;
        if (self.this_balance >= self.trade_config.target_amount) {
            self.trade_step = 2;
            emit(TradeStepEvent{trade_step: 2}.toCell());

            let pool_receiver_balance: Int = self.this_balance * 5 / 100;
            send(SendParameters{
                to: self.protocol_receiver,
                bounce: true,
                value: pool_receiver_balance + ton("0.01"),
                mode:  SendIgnoreErrors,
                body: "%5 tax for add liquidity".asComment()
            });

            self.pool_liquidity = self.this_balance - pool_receiver_balance;
            self.pool_token_amount = self.pool_liquidity * ton("1") / last_token_price;

            if (self.this_supply > self.pool_token_amount) {
                self.burn(myAddress(), self.this_supply - self.pool_token_amount, self.owner); // (from, amount, response_destination)
            } else {
                self.mint(myAddress(), self.pool_token_amount - self.this_supply, self.owner); // (to, amount, response_destination)
            }
        }
        emit(BuyEvent{sender: sender, amount: msg.ton_value, tokenAmount: token_amount, lastTokenPrice: last_token_price, tradeInfo: trade_info}.toCell());
    }

    receive(msg: Sell){
        let ctx: Context = context();
        self.requireNotStopped();
        require(self.trade_step == 1, "not trade");
        require(msg.amount > 0, "value is zero");
        let ton_amount: Int = self.get_amount_out(msg.amount, false, self.this_balance, self.this_supply);
        require(ton_amount > 0, "Sell amount too low");
        require(ton_amount <= self.this_balance, "Insufficient TON in reserves");

        let init: StateInit = initOf JettonDefaultWallet(sender(), myAddress());
        let seller: Address = contractAddress(init);

        send(SendParameters{
            to: seller,
            bounce: true,
            value: ton("0.5"),
            mode: SendIgnoreErrors,
            body: SellInternal{
                sender_from: sender(),
                amount: msg.amount
            }.toCell(),
            data: init.data,
            code: init.code
        });
    }

    receive(msg: SellInternalReply){
        let ctx: Context = context();
        let init_state: StateInit = initOf JettonDefaultWallet(msg.sender_from, myAddress());
        require(ctx.sender == contractAddress(init_state), "contract sender is not from child");

        let ton_amount: Int = self.get_amount_out(msg.amount, false, self.this_balance, self.this_supply);
        self.this_balance = self.this_balance - ton_amount;
        let last_token_price: Int = (ton_amount * ton("1")) / msg.amount;

        let trade_info: TradeInfo = self.split_fee(ton_amount);
        let init: StateInit = initOf JettonDefaultWallet(msg.sender_from, myAddress());
        let seller: Address = contractAddress(init);
        // Transfer from the seller's jetton wallet to the master wallet
        send(SendParameters{
            to: seller,
            bounce: true,
            value: ton("0.2"),
            mode:  SendIgnoreErrors,
            body: TokenTransfer{ 
                query_id: 0,
                amount: msg.amount,
                destination: myAddress(),
                response_destination: null,
                custom_payload: null,
                forward_ton_amount: 0,
                forward_payload: beginCell().endCell().asSlice()
            }.toCell(),
            code: init.code,
            data: init.data
        });
        self.this_supply += msg.amount;

        send(SendParameters{
            to: self.trade_fee_receiver,
            bounce: true,
            value: trade_info.fee_value + trade_info.referrer_amount + trade_info.up_referrer_amount + ton("0.01"),
            mode:  SendIgnoreErrors,
            body: "trade+referrer fee".asComment()
        });

        send(SendParameters{
            to: msg.sender_from,
            bounce: true,
            value: trade_info.remain_amount + ton("0.01"),
            mode:  SendIgnoreErrors,
            body: "remain amount".asComment()
        });

        emit(SellEvent{sender: msg.sender_from, amount: trade_info.remain_amount, tokenAmount: msg.amount, lastTokenPrice: last_token_price, tradeInfo: trade_info}.toCell());
    }

    receive(msg: SetTradeConfig){
        require(sender() == self.owner, "only owner can set trade config");
        self.trade_config = msg.trade_config;
    }

    receive("add_ton_v4"){
        require(self.trade_step == 2, "not add ton liquidity");
        self.sendTonToWalletV4(self.pool_liquidity, 1);
        self.trade_step = 3;
        emit(TradeStepEvent{trade_step: 3}.toCell());
    }

    receive("add_meme_v4"){
        require(self.trade_step == 3, "not add meme liquidity");
        self.sendMemeToWalletV4(myAddress(), self.trade_config.proxy_ton, self.pool_token_amount, 1);
        self.trade_step = 4;
        emit(TradeStepEvent{trade_step: 4}.toCell());
    }

    fun split_fee(amount: Int): TradeInfo {
        let fee_value: Int = amount * self.trade_config.trade_fee_percent / 1000;
        let share_value: Int = amount * (self.trade_config.referrer_percent + self.trade_config.up_referrer_percent) / 1000;
        let referrer_amount: Int = amount * self.trade_config.referrer_percent / 1000;
        let up_referrer_amount: Int = amount * self.trade_config.up_referrer_percent / 1000;
        let remain_amount: Int = ((amount - fee_value) - share_value);
        return
            TradeInfo{
                referrer: self.trade_fee_receiver,
                referrer_amount: referrer_amount,
                up_referrer: self.trade_fee_receiver,
                up_referrer_amount: up_referrer_amount,
                fee_value: fee_value,
                remain_amount: remain_amount
            };
    }

    fun remain_amount(amount: Int): Int {
        return amount - (amount * (self.trade_config.trade_fee_percent + self.trade_config.referrer_percent + self.trade_config.up_referrer_percent) / 1000);
    }

    fun get_amount_out(value: Int, _buy: Bool, reserve_ton: Int, reserve_token: Int): Int {
        if (_buy) {
            return (value * reserve_token) / (reserve_ton + value + self.trade_config.trade_a);
        } else {
            return (value * (reserve_ton + self.trade_config.trade_a)) / (reserve_token + value);
        }
    }

    fun init_buy_amount(init_by_ton_value: Int): Int {
        let remain_amt: Int = self.remain_amount(init_by_ton_value);
        return self.get_amount_out(remain_amt, true, self.this_balance, self.this_supply);
    }

    fun add_liquidity_stonfi(token0: Address, token1: Address, amt0: Int, amt1: Int, min_lp_out: Int) {
        self.sendMemeToWalletV4(token0, token1, amt0, min_lp_out);
        self.sendTonToWalletV4(amt1, min_lp_out);
    }

    fun sendMemeToWalletV4(tokenAddr: Address, otherTokenAddr: Address, tokenAmount: Int, minLPOut: Int){
        let init_a: StateInit = initOf JettonDefaultWallet(myAddress(), myAddress()); // owner, master
        let this_meme_jetton_wallet: Address = contractAddress(init_a);
        let c: Cell = StonfiProvideLiquidity{token_wallet: self.trade_config.router_pton_wallet, min_lp_out: minLPOut}.toCell();
        let forward_cell: Cell = beginCell().storeUint(1, 1).storeRef(c).endCell();
        send(
            SendParameters{
                to: this_meme_jetton_wallet,
                bounce: true,
                value: self.trade_config.ton_value_add_meme,
                mode: SendIgnoreErrors,
                body: TokenTransfer {
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
            value: self.trade_config.ton_value_add_pton,
            mode: SendPayGasSeparately,
            body: TokenTransfer {
                query_id: 0,
                amount: ton_amount,
                destination: self.trade_config.swap_router,
                response_destination: null,
                custom_payload: null,
                forward_ton_amount: ton("0.26"),
                forward_payload: forward_cell.asSlice()
            }.toCell()
        });
    }

    get fun this_supply(): Int {
        return self.this_supply;
    }

    get fun this_balance(): Int {
        return self.this_balance;
    }

    get fun trade_config(): TradeConfig {
        return self.trade_config;
    }

    get fun trade_step(): Int {
        return self.trade_step;
    }

    get fun init_buy_token_amount(ton_value: Int): Int {
        return self.init_buy_amount(ton_value);
    }

    // receive("Resume") is added automatically to allow owner to resume the contract
    // receive("Stop") is added automatically to allow owner to stop the contract
    // get fun stopped(): Bool is added automatically to query if contract is stopped
    // get fun owner(): Address is added automatically to query who the owner is
}