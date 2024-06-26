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

struct EstimateSellResult {
    trade_ton_fee: Int as coins; // in ton
    referrer_ton_fee: Int as coins; // in ton, include referrer and upreferrer
    remain_value: Int as coins; // in ton
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
    transferable: Bool;
    max_supply: Int as coins; // Extract parameter we set here. The Jetton Standards doesn't have this parameter.
    issuer: Address; // meme token issuer

    trade_config: TradeConfig;
    trade_fee_receiver: Address;
    protocol_receiver: Address;
    trade_step: Int as uint8; // 0: init, 1: mint, 2: trade, 3: add ton liquidity, 4: add meme liquidity
    initialized: Bool;
    pool_liquidity: Int as coins; // ton liquididy to be added in ston.fi
    pool_token_amount: Int as coins; // meme liquidity to be added in ston.fi
    backend_bot: Address;
    init(owner: Address,
        content: Cell,
        max_supply: Int,
        trade_config: TradeConfig,
        trade_fee_receiver: Address,
        protocol_receiver: Address,
        issuer: Address,
        backend_bot: Address){
        self.total_supply = 0;
        self.this_supply = 0;
        self.this_balance = 0;
        self.owner = owner;
        self.stopped = false;
        self.mintable = true;
        self.transferable = false;
        self.content = content;
        self.max_supply = max_supply;

        require(trade_config.proxy_ton != newAddress(0, 0), "proxyTon is zero");
        require(trade_config.swap_router != newAddress(0, 0), "swapRouter is zero");
        require(trade_config.router_pton_wallet != newAddress(0, 0), "routerPtonWallet is zero");
        self.trade_config = trade_config;
        require(trade_fee_receiver != newAddress(0, 0), "tradeFeeReceiver is zero");
        require(protocol_receiver != newAddress(0, 0), "protocolReceiver is zero");
        require(issuer != newAddress(0, 0), "issuer is zero");
        require(backend_bot != newAddress(0, 0), "backendBot is zero");
        self.trade_fee_receiver = trade_fee_receiver;
        self.protocol_receiver = protocol_receiver;
        self.trade_step = 1;
        self.initialized = false;
        self.issuer = issuer;
        self.pool_liquidity = 0;
        self.pool_token_amount = 0;
        self.backend_bot = backend_bot;
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
            require(context().value >= msg.buy_ton_value + ton("0.4"), "insufficient pay for gas");
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
        require(ctx.value >= ton("0.3") + msg.ton_value, "insufficient pay for base gas");
        require(msg.ton_value > 0, "value is zero");
        let trade_info: TradeInfo = self.split_fee(msg.ton_value);
        let token_amount: Int = self.get_amount_out(trade_info.remain_amount, true, self.this_balance, self.this_supply);
        require(token_amount <= self.this_supply, "Insufficient token balance");

        if (trade_info.fee_value + trade_info.referrer_amount + trade_info.up_referrer_amount >= ton("0.01")) {
            send(SendParameters{
                to: self.trade_fee_receiver,
                bounce: true,
                value: trade_info.fee_value + trade_info.referrer_amount + trade_info.up_referrer_amount,
                mode:  SendIgnoreErrors,
                body: "trade+referrer fee".asComment()
            });
        }

        self.this_balance += trade_info.remain_amount;
        let last_token_price: Int = (trade_info.remain_amount * ton("1")) / token_amount;
        // Transfer from the master's jetton wallet to the buyer
        let init: StateInit = initOf JettonDefaultWallet(myAddress(), myAddress());
        send(SendParameters{
            to: contractAddress(init),
            bounce: true,
            value: ton("0.15"),
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
            let pool_receiver_balance: Int = self.this_balance * 5 / 100;
            send(SendParameters{
                to: self.protocol_receiver,
                bounce: true,
                value: pool_receiver_balance,
                mode:  SendIgnoreErrors,
                body: "%5 tax for add liquidity".asComment()
            });

            self.pool_liquidity = self.this_balance - pool_receiver_balance;
            self.pool_token_amount = self.pool_liquidity * ton("1") / last_token_price;

            if (self.this_supply > self.pool_token_amount) {
                self.burn(myAddress(), self.this_supply - self.pool_token_amount, myAddress()); // (from, amount, response_destination)
            } else {
                self.mint(myAddress(), self.pool_token_amount - self.this_supply, self.owner); // (to, amount, response_destination)
            }
            self.trade_step = 2;
            emit(TradeStepEvent{trade_step: 2}.toCell());
        }
        last_token_price = ton("0.000985") * ton("1") / self.init_buy_amount(ton("0.001"));
        emit(BuyEvent{sender: sender, amount: msg.ton_value, tokenAmount: token_amount, lastTokenPrice: last_token_price, tradeInfo: trade_info}.toCell());
    }

    receive(msg: SetTradeConfig){
        require(sender() == self.owner, "only owner can set trade config");
        require(msg.trade_config.proxy_ton != newAddress(0, 0), "proxyTon is zero");
        require(msg.trade_config.swap_router != newAddress(0, 0), "swapRouter is zero");
        require(msg.trade_config.router_pton_wallet != newAddress(0, 0), "routerPtonWallet is zero");
        self.trade_config = msg.trade_config;
    }

    receive("add_ton_v4"){
        require(self.trade_step == 2 || context().sender == self.backend_bot, "not add ton liquidity");
        self.trade_step = 3;
        emit(TradeStepEvent{trade_step: 3}.toCell());
        self.sendTonToWalletV4(self.pool_liquidity, 1);
    }

    receive("add_meme_v4"){
        require(self.trade_step == 3 || context().sender == self.backend_bot, "not add meme liquidity");
        self.sendMemeToWalletV4(myAddress(), self.trade_config.proxy_ton, self.pool_token_amount, 1);
        self.trade_step = 4;
        emit(TradeStepEvent{trade_step: 4}.toCell());
    }

    receive("transferable") {
        require(context().sender == self.backend_bot, "not owner");
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

    receive(msg: JettonTransferNotification) {
        if (self.trade_step == 1) {
            let ctx: Context = context();
            let init_state: StateInit = initOf JettonDefaultWallet(myAddress(), myAddress());
            require(ctx.sender == contractAddress(init_state), "contract sender is not from child");

            let ton_amount: Int = self.get_amount_out(msg.amount, false, self.this_balance, self.this_supply);
            self.this_balance = self.this_balance - ton_amount;
            let trade_info: TradeInfo = self.split_fee(ton_amount);
            self.this_supply += msg.amount;

            if (trade_info.fee_value + trade_info.referrer_amount + trade_info.up_referrer_amount >= ton("0.01")) {
                send(SendParameters{
                    to: self.trade_fee_receiver,
                    bounce: true,
                    value: trade_info.fee_value + trade_info.referrer_amount + trade_info.up_referrer_amount,
                    mode:  SendIgnoreErrors,
                    body: "trade+referrer fee".asComment()
                });
            }

            send(SendParameters{
                to: msg.sender,
                bounce: false,
                value: trade_info.remain_amount,
                mode:  SendIgnoreErrors,
                body: "remain amount".asComment()
            });
            let last_token_price: Int = ton("0.000985") * ton("1") / self.init_buy_amount(ton("0.001"));
            emit(SellEvent{sender: msg.sender, amount: trade_info.remain_amount, tokenAmount: msg.amount, lastTokenPrice: last_token_price, tradeInfo: trade_info}.toCell());
            self.forward(msg.sender, "Sell finish".asComment(), false, null);
        } else {
            let thisinit: StateInit = self.getJettonWalletInit(myAddress());
            send(SendParameters{
                to: contractAddress(thisinit),
                bounce: false,
                value: 0,
                mode:  SendRemainingValue | SendIgnoreErrors,
                body: TokenTransfer{
                    query_id: 0,
                    amount: msg.amount,
                    destination: msg.sender,
                    response_destination: null,
                    custom_payload: null,
                    forward_ton_amount: 0,
                    forward_payload: beginCell().endCell().asSlice()
                }.toCell(),
            });
        }
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
            value: ton_amount + ton("0.26"),
            mode: SendIgnoreErrors,
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

    get fun estimate_sell_result(token_amount: Int): EstimateSellResult {
        let ton_amount: Int = self.get_amount_out(token_amount, false, self.this_balance, self.this_supply);
        return EstimateSellResult{
            trade_ton_fee: ton_amount * self.trade_config.trade_fee_percent / 1000,
            referrer_ton_fee: ton_amount * (self.trade_config.referrer_percent + self.trade_config.up_referrer_percent) / 1000,
            remain_value: ton_amount - (ton_amount * (self.trade_config.trade_fee_percent + self.trade_config.referrer_percent + self.trade_config.up_referrer_percent) / 1000)
        };
    }

    // receive("Resume") is added automatically to allow owner to resume the contract
    // receive("Stop") is added automatically to allow owner to stop the contract
    // get fun stopped(): Bool is added automatically to query if contract is stopped
    // get fun owner(): Address is added automatically to query who the owner is
}
