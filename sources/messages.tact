struct JettonData {
    total_supply: Int;
    mintable: Bool;
    owner: Address;
    content: Cell;
    wallet_code: Cell;
}
struct JettonWalletData {
    balance: Int;
    owner: Address;
    master: Address;
    code: Cell;
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
message(0x178d4519) TokenTransferInternal {
    query_id: Int as uint64;
    amount: Int as coins;
    from: Address;
    response_destination: Address?;
    forward_ton_amount: Int as coins;
    forward_payload: Slice as remaining;
}
message(0x7362d09c) JettonTransferNotification {
    query_id: Int as uint64;                // arbitrary request number
    amount: Int as coins;                   // amount of jettons to transfer
    sender: Address;                        // address of the sender of the jettons
    forward_payload: Slice as remaining;    // optional custom payload
}
// burn#595f07bc query_id:uint64 amount:(VarUInteger 16)
//               response_destination:MsgAddress custom_payload:(Maybe ^Cell)
//               = InternalMsgBody;
message(0x595f07bc) TokenBurn {
    query_id: Int as uint64; // arbitrary request number.
    amount: Int as coins; // amount of burned jettons
    response_destination: Address?; // address where to send a response with confirmation of a successful burn and the rest of the incoming message coins.
    custom_payload: Cell?; // optional custom data
}
message(0x7bdd97de) TokenBurnNotification {
    query_id: Int as uint64;
    amount: Int as coins;
    sender: Address;
    response_destination: Address?;
}
message(0xd53276db) TokenExcesses {
    query_id: Int as uint64;
}
message TokenUpdateContent {
    content: Cell;
}
// ==== TEP89: Jetton Wallet Discovery ====
message(0x2c76b973) ProvideWalletAddress {
    query_id: Int as uint64;
    owner_address: Address;
    include_address: Bool;
}
// take_wallet_address#d1735400
// query_id:uint64 wallet_address:MsgAddress owner_address:(Maybe ^MsgAddress) = InternalMsgBody;
message(0xd1735400) TakeWalletAddress {
    query_id: Int as uint64;
    wallet_address: Address;
    owner_address: Slice as remaining;
}

struct TokenTransferStruct {
    query_id: Int;
    amount: Int;
    destination: Address;
    response_destination: Address?;
    custom_payload: Cell?;
    forward_ton_amount: Int;
    forward_payload: Slice;
}

message CheckTransfer{
    req: Address;
    token_transfer: TokenTransferStruct;
}

message CheckTransferReply{
    req: Address;
    res: Bool;
    token_transfer: TokenTransferStruct;
}

message DirectAddLiquidity {
    lp_account: Address;
    amt0: Int as coins;
    amt1: Int as coins;
    min_lp_out: Int as coins;
}