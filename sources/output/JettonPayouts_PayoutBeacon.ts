import { 
    Cell,
    Slice, 
    Address, 
    Builder, 
    beginCell, 
    ComputeError, 
    TupleItem, 
    TupleReader, 
    Dictionary, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    Contract, 
    ContractABI, 
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    let sc_0 = slice;
    let _code = sc_0.loadRef();
    let _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function loadTupleStateInit(source: TupleReader) {
    let _code = source.readCell();
    let _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function storeTupleStateInit(source: StateInit) {
    let builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounced: boolean;
    sender: Address;
    value: bigint;
    raw: Cell;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounced);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw);
    };
}

export function loadContext(slice: Slice) {
    let sc_0 = slice;
    let _bounced = sc_0.loadBit();
    let _sender = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _raw = sc_0.loadRef();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function loadTupleContext(source: TupleReader) {
    let _bounced = source.readBoolean();
    let _sender = source.readAddress();
    let _value = source.readBigNumber();
    let _raw = source.readCell();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function storeTupleContext(source: Context) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounced);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw);
    return builder.build();
}

function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: bigint;
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounce);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.value, 257);
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
    };
}

export function loadSendParameters(slice: Slice) {
    let sc_0 = slice;
    let _bounce = sc_0.loadBit();
    let _to = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _mode = sc_0.loadIntBig(257);
    let _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function loadTupleSendParameters(source: TupleReader) {
    let _bounce = source.readBoolean();
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _body = source.readCellOpt();
    let _code = source.readCellOpt();
    let _data = source.readCellOpt();
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function storeTupleSendParameters(source: SendParameters) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounce);
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function loadTupleDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function storeTupleDeploy(source: Deploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function loadTupleDeployOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function storeTupleDeployOk(source: DeployOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function loadTupleFactoryDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function storeTupleFactoryDeploy(source: FactoryDeploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

function loadTupleChangeOwner(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

function storeTupleChangeOwner(source: ChangeOwner) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

function loadTupleChangeOwnerOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type TryPayout = {
    $$type: 'TryPayout';
    address: Address;
    value: bigint;
    nonce: bigint;
    payout_id: bigint;
    jetton_wallet: Address;
}

export function storeTryPayout(src: TryPayout) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(729366486, 32);
        b_0.storeAddress(src.address);
        b_0.storeUint(src.value, 64);
        b_0.storeUint(src.nonce, 32);
        b_0.storeUint(src.payout_id, 32);
        b_0.storeAddress(src.jetton_wallet);
    };
}

export function loadTryPayout(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 729366486) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _value = sc_0.loadUintBig(64);
    let _nonce = sc_0.loadUintBig(32);
    let _payout_id = sc_0.loadUintBig(32);
    let _jetton_wallet = sc_0.loadAddress();
    return { $$type: 'TryPayout' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id, jetton_wallet: _jetton_wallet };
}

function loadTupleTryPayout(source: TupleReader) {
    let _address = source.readAddress();
    let _value = source.readBigNumber();
    let _nonce = source.readBigNumber();
    let _payout_id = source.readBigNumber();
    let _jetton_wallet = source.readAddress();
    return { $$type: 'TryPayout' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id, jetton_wallet: _jetton_wallet };
}

function storeTupleTryPayout(source: TryPayout) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.value);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.payout_id);
    builder.writeAddress(source.jetton_wallet);
    return builder.build();
}

function dictValueParserTryPayout(): DictionaryValue<TryPayout> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTryPayout(src)).endCell());
        },
        parse: (src) => {
            return loadTryPayout(src.loadRef().beginParse());
        }
    }
}

export type PayoutOk = {
    $$type: 'PayoutOk';
    address: Address;
    value: bigint;
    nonce: bigint;
    payout_id: bigint;
    jetton_wallet: Address;
}

export function storePayoutOk(src: PayoutOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1023403868, 32);
        b_0.storeAddress(src.address);
        b_0.storeUint(src.value, 64);
        b_0.storeUint(src.nonce, 32);
        b_0.storeUint(src.payout_id, 32);
        b_0.storeAddress(src.jetton_wallet);
    };
}

export function loadPayoutOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1023403868) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _value = sc_0.loadUintBig(64);
    let _nonce = sc_0.loadUintBig(32);
    let _payout_id = sc_0.loadUintBig(32);
    let _jetton_wallet = sc_0.loadAddress();
    return { $$type: 'PayoutOk' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id, jetton_wallet: _jetton_wallet };
}

function loadTuplePayoutOk(source: TupleReader) {
    let _address = source.readAddress();
    let _value = source.readBigNumber();
    let _nonce = source.readBigNumber();
    let _payout_id = source.readBigNumber();
    let _jetton_wallet = source.readAddress();
    return { $$type: 'PayoutOk' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id, jetton_wallet: _jetton_wallet };
}

function storeTuplePayoutOk(source: PayoutOk) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.value);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.payout_id);
    builder.writeAddress(source.jetton_wallet);
    return builder.build();
}

function dictValueParserPayoutOk(): DictionaryValue<PayoutOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePayoutOk(src)).endCell());
        },
        parse: (src) => {
            return loadPayoutOk(src.loadRef().beginParse());
        }
    }
}

export type PayoutFailed = {
    $$type: 'PayoutFailed';
    address: Address;
    value: bigint;
    nonce: bigint;
    payout_id: bigint;
    jetton_wallet: Address;
}

export function storePayoutFailed(src: PayoutFailed) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3495766146, 32);
        b_0.storeAddress(src.address);
        b_0.storeUint(src.value, 64);
        b_0.storeUint(src.nonce, 32);
        b_0.storeUint(src.payout_id, 32);
        b_0.storeAddress(src.jetton_wallet);
    };
}

export function loadPayoutFailed(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3495766146) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _value = sc_0.loadUintBig(64);
    let _nonce = sc_0.loadUintBig(32);
    let _payout_id = sc_0.loadUintBig(32);
    let _jetton_wallet = sc_0.loadAddress();
    return { $$type: 'PayoutFailed' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id, jetton_wallet: _jetton_wallet };
}

function loadTuplePayoutFailed(source: TupleReader) {
    let _address = source.readAddress();
    let _value = source.readBigNumber();
    let _nonce = source.readBigNumber();
    let _payout_id = source.readBigNumber();
    let _jetton_wallet = source.readAddress();
    return { $$type: 'PayoutFailed' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id, jetton_wallet: _jetton_wallet };
}

function storeTuplePayoutFailed(source: PayoutFailed) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.value);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.payout_id);
    builder.writeAddress(source.jetton_wallet);
    return builder.build();
}

function dictValueParserPayoutFailed(): DictionaryValue<PayoutFailed> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePayoutFailed(src)).endCell());
        },
        parse: (src) => {
            return loadPayoutFailed(src.loadRef().beginParse());
        }
    }
}

export type EventPayoutCompleted = {
    $$type: 'EventPayoutCompleted';
    address: Address;
    value: bigint;
    nonce: bigint;
    payout_id: bigint;
    jetton_wallet: Address;
}

export function storeEventPayoutCompleted(src: EventPayoutCompleted) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(502577544, 32);
        b_0.storeAddress(src.address);
        b_0.storeUint(src.value, 64);
        b_0.storeUint(src.nonce, 32);
        b_0.storeUint(src.payout_id, 32);
        b_0.storeAddress(src.jetton_wallet);
    };
}

export function loadEventPayoutCompleted(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 502577544) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _value = sc_0.loadUintBig(64);
    let _nonce = sc_0.loadUintBig(32);
    let _payout_id = sc_0.loadUintBig(32);
    let _jetton_wallet = sc_0.loadAddress();
    return { $$type: 'EventPayoutCompleted' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id, jetton_wallet: _jetton_wallet };
}

function loadTupleEventPayoutCompleted(source: TupleReader) {
    let _address = source.readAddress();
    let _value = source.readBigNumber();
    let _nonce = source.readBigNumber();
    let _payout_id = source.readBigNumber();
    let _jetton_wallet = source.readAddress();
    return { $$type: 'EventPayoutCompleted' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id, jetton_wallet: _jetton_wallet };
}

function storeTupleEventPayoutCompleted(source: EventPayoutCompleted) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.value);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.payout_id);
    builder.writeAddress(source.jetton_wallet);
    return builder.build();
}

function dictValueParserEventPayoutCompleted(): DictionaryValue<EventPayoutCompleted> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventPayoutCompleted(src)).endCell());
        },
        parse: (src) => {
            return loadEventPayoutCompleted(src.loadRef().beginParse());
        }
    }
}

export type WithdrawTicketContent = {
    $$type: 'WithdrawTicketContent';
    address: Address;
    value: bigint;
    nonce: bigint;
    expire: bigint;
    payout_id: bigint;
    jetton_wallet: Address;
}

export function storeWithdrawTicketContent(src: WithdrawTicketContent) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1162710104, 32);
        b_0.storeAddress(src.address);
        b_0.storeUint(src.value, 64);
        b_0.storeUint(src.nonce, 32);
        b_0.storeUint(src.expire, 32);
        b_0.storeUint(src.payout_id, 32);
        b_0.storeAddress(src.jetton_wallet);
    };
}

export function loadWithdrawTicketContent(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1162710104) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _value = sc_0.loadUintBig(64);
    let _nonce = sc_0.loadUintBig(32);
    let _expire = sc_0.loadUintBig(32);
    let _payout_id = sc_0.loadUintBig(32);
    let _jetton_wallet = sc_0.loadAddress();
    return { $$type: 'WithdrawTicketContent' as const, address: _address, value: _value, nonce: _nonce, expire: _expire, payout_id: _payout_id, jetton_wallet: _jetton_wallet };
}

function loadTupleWithdrawTicketContent(source: TupleReader) {
    let _address = source.readAddress();
    let _value = source.readBigNumber();
    let _nonce = source.readBigNumber();
    let _expire = source.readBigNumber();
    let _payout_id = source.readBigNumber();
    let _jetton_wallet = source.readAddress();
    return { $$type: 'WithdrawTicketContent' as const, address: _address, value: _value, nonce: _nonce, expire: _expire, payout_id: _payout_id, jetton_wallet: _jetton_wallet };
}

function storeTupleWithdrawTicketContent(source: WithdrawTicketContent) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.value);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.expire);
    builder.writeNumber(source.payout_id);
    builder.writeAddress(source.jetton_wallet);
    return builder.build();
}

function dictValueParserWithdrawTicketContent(): DictionaryValue<WithdrawTicketContent> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawTicketContent(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawTicketContent(src.loadRef().beginParse());
        }
    }
}

export type WithdrawTicket = {
    $$type: 'WithdrawTicket';
    ticket: WithdrawTicketContent;
    signature: Cell;
}

export function storeWithdrawTicket(src: WithdrawTicket) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3214370963, 32);
        b_0.store(storeWithdrawTicketContent(src.ticket));
        b_0.storeRef(src.signature);
    };
}

export function loadWithdrawTicket(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3214370963) { throw Error('Invalid prefix'); }
    let _ticket = loadWithdrawTicketContent(sc_0);
    let _signature = sc_0.loadRef();
    return { $$type: 'WithdrawTicket' as const, ticket: _ticket, signature: _signature };
}

function loadTupleWithdrawTicket(source: TupleReader) {
    const _ticket = loadTupleWithdrawTicketContent(source.readTuple());
    let _signature = source.readCell();
    return { $$type: 'WithdrawTicket' as const, ticket: _ticket, signature: _signature };
}

function storeTupleWithdrawTicket(source: WithdrawTicket) {
    let builder = new TupleBuilder();
    builder.writeTuple(storeTupleWithdrawTicketContent(source.ticket));
    builder.writeSlice(source.signature);
    return builder.build();
}

function dictValueParserWithdrawTicket(): DictionaryValue<WithdrawTicket> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawTicket(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawTicket(src.loadRef().beginParse());
        }
    }
}

export type InitJettonWallet = {
    $$type: 'InitJettonWallet';
    jetton_wallet: Address;
}

export function storeInitJettonWallet(src: InitJettonWallet) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1508159456, 32);
        b_0.storeAddress(src.jetton_wallet);
    };
}

export function loadInitJettonWallet(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1508159456) { throw Error('Invalid prefix'); }
    let _jetton_wallet = sc_0.loadAddress();
    return { $$type: 'InitJettonWallet' as const, jetton_wallet: _jetton_wallet };
}

function loadTupleInitJettonWallet(source: TupleReader) {
    let _jetton_wallet = source.readAddress();
    return { $$type: 'InitJettonWallet' as const, jetton_wallet: _jetton_wallet };
}

function storeTupleInitJettonWallet(source: InitJettonWallet) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.jetton_wallet);
    return builder.build();
}

function dictValueParserInitJettonWallet(): DictionaryValue<InitJettonWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeInitJettonWallet(src)).endCell());
        },
        parse: (src) => {
            return loadInitJettonWallet(src.loadRef().beginParse());
        }
    }
}

export type TokenTransfer = {
    $$type: 'TokenTransfer';
    query_id: bigint;
    amount: bigint;
    destination: Address;
    response_destination: Address | null;
    custom_payload: Cell | null;
    forward_ton_amount: bigint;
    forward_payload: Cell;
}

export function storeTokenTransfer(src: TokenTransfer) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(260734629, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
        b_0.storeAddress(src.response_destination);
        if (src.custom_payload !== null && src.custom_payload !== undefined) { b_0.storeBit(true).storeRef(src.custom_payload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forward_ton_amount);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadTokenTransfer(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 260734629) { throw Error('Invalid prefix'); }
    let _query_id = sc_0.loadUintBig(64);
    let _amount = sc_0.loadCoins();
    let _destination = sc_0.loadAddress();
    let _response_destination = sc_0.loadMaybeAddress();
    let _custom_payload = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _forward_ton_amount = sc_0.loadCoins();
    let _forward_payload = sc_0.asCell();
    return { $$type: 'TokenTransfer' as const, query_id: _query_id, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

function loadTupleTokenTransfer(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _amount = source.readBigNumber();
    let _destination = source.readAddress();
    let _response_destination = source.readAddressOpt();
    let _custom_payload = source.readCellOpt();
    let _forward_ton_amount = source.readBigNumber();
    let _forward_payload = source.readCell();
    return { $$type: 'TokenTransfer' as const, query_id: _query_id, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

function storeTupleTokenTransfer(source: TokenTransfer) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    builder.writeAddress(source.response_destination);
    builder.writeCell(source.custom_payload);
    builder.writeNumber(source.forward_ton_amount);
    builder.writeSlice(source.forward_payload);
    return builder.build();
}

function dictValueParserTokenTransfer(): DictionaryValue<TokenTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTokenTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadTokenTransfer(src.loadRef().beginParse());
        }
    }
}

export type SetPublicKey = {
    $$type: 'SetPublicKey';
    public_key: bigint;
}

export function storeSetPublicKey(src: SetPublicKey) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(4150209624, 32);
        b_0.storeUint(src.public_key, 256);
    };
}

export function loadSetPublicKey(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 4150209624) { throw Error('Invalid prefix'); }
    let _public_key = sc_0.loadUintBig(256);
    return { $$type: 'SetPublicKey' as const, public_key: _public_key };
}

function loadTupleSetPublicKey(source: TupleReader) {
    let _public_key = source.readBigNumber();
    return { $$type: 'SetPublicKey' as const, public_key: _public_key };
}

function storeTupleSetPublicKey(source: SetPublicKey) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.public_key);
    return builder.build();
}

function dictValueParserSetPublicKey(): DictionaryValue<SetPublicKey> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPublicKey(src)).endCell());
        },
        parse: (src) => {
            return loadSetPublicKey(src.loadRef().beginParse());
        }
    }
}

 type PayoutBeacon_init_args = {
    $$type: 'PayoutBeacon_init_args';
    owner: Address;
    master: Address;
}

function initPayoutBeacon_init_args(src: PayoutBeacon_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.master);
    };
}

async function PayoutBeacon_init(owner: Address, master: Address) {
    const __code = Cell.fromBase64('te6ccgECHgEABTAAART/APSkE/S88sgLAQIBYgIDA3rQAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zxVEts88uCCGgQFAgEgDg8EsAGPNoAg1yFwIddJwh+VMCDXCx/eghA8/+dcuo8Z0x8BghA8/+dcuvLggW0xMKWIUjBwbds8f+Awf+BwIddJwh+VMCDXCx/eIIIQK3k/1rrjAoIQlGqYtroGCwcIAJzI+EMBzH8BygBVIFog10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZYINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8Wyx/J7VQAIgAAAABQYXlvdXQgZmFpbGVkAbIw0x8BghAreT/WuvLggfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB0z/TH9Mf+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBUUQzBsFQkBWI6n0x8BghCUapi2uvLggdM/ATHIAYIQr/kPV1jLH8s/yfhCAXBt2zx/4DBwCwLwNPhBbyQQI18DgRFNU3HHBfL0UyW6jt4nVSAFEDTIVUCCENBdKIJQBssfUAQg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxYSyz/LH8sfASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFslwbds84w1/CwoBwgWkJ1UgBRA0yFVAghA8/+dcUAbLH1AEINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WEss/yx/LHwEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJEn9t2zwLApJtbSJus5lbIG7y0IBvIgGRMuL4QW8kE18D+CdvEAGhghAF9eEAuY6VghAF9eEAcPsCECRwAwSBAIJQI9s84BAkcAMEgEJQI9s8DAwByshxAcoBUAcBygBwAcoCUAUg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQA/oCcAHKaCNus5F/kyRus+KXMzMBcAHKAOMNIW6znH8BygABIG7y0IABzJUxcAHKAOLJAfsADQCYfwHKAMhwAcoAcAHKACRus51/AcoABCBu8tCAUATMljQDcAHKAOIkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDicAHKAAJ/AcoAAslYzAIRviju2ebZ42GMGhACASAREgACIgIDe6ATFAIBSBYXAg+msbZ5tnjYYxoVANunowTgudh6ullc9j0J2HOslQo2zQThO6xqWlbI+WZFp15b++LEcwTgQKuANwDOxymcsHVcjktlhwTgN6k73yqLLeOOp6e8CrOGTQThOy6ctWadluZ0HSzbKM3RSQTggZzq084r86ShYDrC3EyPZQACIAARsK+7UTQ0gABgAgEgGBkCEa7e7Z5tnjYYwBobAHWs3caGrS4MzmdF5eotqy8sjojoTqkNagwspoYpyYao6ObsrS1KDQ8MjicvLoZLSgqOrWZKqEjNBoqQQAG87UTQ1AH4Y9IAAY5G+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAdMfVSBsE+D4KNcLCoMJuvLgiRwAAiEBivpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBIC0QHbPB0AAnA=');
    const __system = Cell.fromBase64('te6cckECIAEABToAAQHAAQEFoLfPAgEU/wD0pBP0vPLICwMCAWIEDwN60AHQ0wMBcbCjAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IhUUFMDbwT4YQL4Yts8VRLbPPLgghsFDgSwAY82gCDXIXAh10nCH5UwINcLH96CEDz/51y6jxnTHwGCEDz/51y68uCBbTEwpYhSMHBt2zx/4DB/4HAh10nCH5UwINcLH94gghAreT/WuuMCghCUapi2ugYLBwoAIgAAAABQYXlvdXQgZmFpbGVkAbIw0x8BghAreT/WuvLggfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB0z/TH9Mf+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBUUQzBsFQgC8DT4QW8kECNfA4ERTVNxxwXy9FMluo7eJ1UgBRA0yFVAghDQXSiCUAbLH1AEINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WEss/yx/LHwEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJcG3bPOMNfwsJAcIFpCdVIAUQNMhVQIIQPP/nXFAGyx9QBCDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFhLLP8sfyx8BINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyRJ/bds8CwFYjqfTHwGCEJRqmLa68uCB0z8BMcgBghCv+Q9XWMsfyz/J+EIBcG3bPH/gMHALApJtbSJus5lbIG7y0IBvIgGRMuL4QW8kE18D+CdvEAGhghAF9eEAuY6VghAF9eEAcPsCECRwAwSBAIJQI9s84BAkcAMEgEJQI9s8DAwByshxAcoBUAcBygBwAcoCUAUg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQA/oCcAHKaCNus5F/kyRus+KXMzMBcAHKAOMNIW6znH8BygABIG7y0IABzJUxcAHKAOLJAfsADQCYfwHKAMhwAcoAcAHKACRus51/AcoABCBu8tCAUATMljQDcAHKAOIkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDicAHKAAJ/AcoAAslYzACcyPhDAcx/AcoAVSBaINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WWCDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFssfye1UAgEgEBICEb4o7tnm2eNhjBsRAAIiAgEgExcCA3ugFBYCD6axtnm2eNhjGxUAAiAA26ejBOC52Hq6WVz2PQnYc6yVCjbNBOE7rGpaVsj5ZkWnXlv74sRzBOBAq4A3AM7HKZywdVyOS2WHBOA3qTvfKost446np7wKs4ZNBOE7Lpy1Zp2W5nQdLNsozdFJBOCBnOrTzivzpKFgOsLcTI9lAgFIGBkAEbCvu1E0NIAAYAIBIBofAhGu3u2ebZ42GMAbHgG87UTQ1AH4Y9IAAY5G+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAdMfVSBsE+D4KNcLCoMJuvLgiRwBivpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBIC0QHbPB0AAnAAAiEAdazdxoatLgzOZ0Xl6i2rLyyOiOhOqQ1qDCymhinJhqjo5uytLUoNDwyOJy8uhktKCo6tZkqoSM0GipBAFSThtg==');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initPayoutBeacon_init_args({ $$type: 'PayoutBeacon_init_args', owner, master })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const PayoutBeacon_errors: { [key: number]: { message: string } } = {
    2: { message: `Stack underflow` },
    3: { message: `Stack overflow` },
    4: { message: `Integer overflow` },
    5: { message: `Integer out of expected range` },
    6: { message: `Invalid opcode` },
    7: { message: `Type check error` },
    8: { message: `Cell overflow` },
    9: { message: `Cell underflow` },
    10: { message: `Dictionary error` },
    13: { message: `Out of gas error` },
    32: { message: `Method ID not found` },
    34: { message: `Action is invalid or not supported` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    128: { message: `Null reference exception` },
    129: { message: `Invalid serialization prefix` },
    130: { message: `Invalid incoming message` },
    131: { message: `Constraints error` },
    132: { message: `Access denied` },
    133: { message: `Contract stopped` },
    134: { message: `Invalid argument` },
    135: { message: `Code of a contract was not found` },
    136: { message: `Invalid address` },
    137: { message: `Masterchain support is not enabled for this contract` },
    4429: { message: `Invalid sender` },
    16059: { message: `Invalid value` },
    17473: { message: `Expired` },
    26429: { message: `Invalid jetton wallet address` },
    28414: { message: `Invalid withdraw signature` },
    40368: { message: `Contract stopped` },
    51218: { message: `Only owner can init this jetton wallet` },
    53296: { message: `Contract not stopped` },
}

const PayoutBeacon_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounced","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"TryPayout","header":729366486,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"payout_id","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"jetton_wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"PayoutOk","header":1023403868,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"payout_id","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"jetton_wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"PayoutFailed","header":3495766146,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"payout_id","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"jetton_wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"EventPayoutCompleted","header":502577544,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"payout_id","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"jetton_wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"WithdrawTicketContent","header":1162710104,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"expire","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"payout_id","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"jetton_wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"WithdrawTicket","header":3214370963,"fields":[{"name":"ticket","type":{"kind":"simple","type":"WithdrawTicketContent","optional":false}},{"name":"signature","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"InitJettonWallet","header":1508159456,"fields":[{"name":"jetton_wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"TokenTransfer","header":260734629,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":true}},{"name":"custom_payload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forward_ton_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"SetPublicKey","header":4150209624,"fields":[{"name":"public_key","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
]

const PayoutBeacon_getters: ABIGetter[] = [
    {"name":"master","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"nonce","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"owner","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

const PayoutBeacon_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"TryPayout"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]

export class PayoutBeacon implements Contract {
    
    static async init(owner: Address, master: Address) {
        return await PayoutBeacon_init(owner, master);
    }
    
    static async fromInit(owner: Address, master: Address) {
        const init = await PayoutBeacon_init(owner, master);
        const address = contractAddress(0, init);
        return new PayoutBeacon(address, init);
    }
    
    static fromAddress(address: Address) {
        return new PayoutBeacon(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  PayoutBeacon_types,
        getters: PayoutBeacon_getters,
        receivers: PayoutBeacon_receivers,
        errors: PayoutBeacon_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: TryPayout | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TryPayout') {
            body = beginCell().store(storeTryPayout(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getMaster(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('master', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
    async getNonce(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('nonce', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('owner', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
}