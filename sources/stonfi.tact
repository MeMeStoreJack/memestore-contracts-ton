message PoolStorage {
    router_address: Address;
    lp_fee: Int as uint8;
    protocol_fee: Int as uint8;
    ref_fee: Int as uint8;
    token0_address: Address;
    token1_address: Address;
    total_supply_lp: Int as coins;
    collected_token0_protocol_fee: Int as coins;
    collected_token1_protocol_fee: Int as coins;
    protocol_fee_address: Address;
    reserve0: Int as coins;
    reserve1: Int as coins;
    jetton_lp_wallet_code: Cell;
    lp_account_code: Cell;
}
message(0xfcf9e58f) StonfiProvideLiquidity {
    token_wallet: Address;
    min_lp_out: Int as coins;
}
message(0x7362d09c) ProvideLiquidity {
    jettonAmount: Int as coins;
    fromAddress: Address;
    providerLiquidityBody: StonfiProvideLiquidity;
}