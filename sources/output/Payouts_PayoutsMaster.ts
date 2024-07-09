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
}

export function storeTryPayout(src: TryPayout) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1461426324, 32);
        b_0.storeAddress(src.address);
        b_0.storeCoins(src.value);
        b_0.storeUint(src.nonce, 64);
        b_0.storeUint(src.payout_id, 64);
    };
}

export function loadTryPayout(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1461426324) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _value = sc_0.loadCoins();
    let _nonce = sc_0.loadUintBig(64);
    let _payout_id = sc_0.loadUintBig(64);
    return { $$type: 'TryPayout' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id };
}

function loadTupleTryPayout(source: TupleReader) {
    let _address = source.readAddress();
    let _value = source.readBigNumber();
    let _nonce = source.readBigNumber();
    let _payout_id = source.readBigNumber();
    return { $$type: 'TryPayout' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id };
}

function storeTupleTryPayout(source: TryPayout) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.value);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.payout_id);
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
}

export function storePayoutOk(src: PayoutOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2702590057, 32);
        b_0.storeAddress(src.address);
        b_0.storeCoins(src.value);
        b_0.storeUint(src.nonce, 64);
        b_0.storeUint(src.payout_id, 64);
    };
}

export function loadPayoutOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2702590057) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _value = sc_0.loadCoins();
    let _nonce = sc_0.loadUintBig(64);
    let _payout_id = sc_0.loadUintBig(64);
    return { $$type: 'PayoutOk' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id };
}

function loadTuplePayoutOk(source: TupleReader) {
    let _address = source.readAddress();
    let _value = source.readBigNumber();
    let _nonce = source.readBigNumber();
    let _payout_id = source.readBigNumber();
    return { $$type: 'PayoutOk' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id };
}

function storeTuplePayoutOk(source: PayoutOk) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.value);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.payout_id);
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
}

export function storePayoutFailed(src: PayoutFailed) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1116275650, 32);
        b_0.storeAddress(src.address);
        b_0.storeCoins(src.value);
        b_0.storeUint(src.nonce, 64);
        b_0.storeUint(src.payout_id, 64);
    };
}

export function loadPayoutFailed(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1116275650) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _value = sc_0.loadCoins();
    let _nonce = sc_0.loadUintBig(64);
    let _payout_id = sc_0.loadUintBig(64);
    return { $$type: 'PayoutFailed' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id };
}

function loadTuplePayoutFailed(source: TupleReader) {
    let _address = source.readAddress();
    let _value = source.readBigNumber();
    let _nonce = source.readBigNumber();
    let _payout_id = source.readBigNumber();
    return { $$type: 'PayoutFailed' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id };
}

function storeTuplePayoutFailed(source: PayoutFailed) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.value);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.payout_id);
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
}

export function storeEventPayoutCompleted(src: EventPayoutCompleted) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3516491073, 32);
        b_0.storeAddress(src.address);
        b_0.storeCoins(src.value);
        b_0.storeUint(src.nonce, 64);
        b_0.storeUint(src.payout_id, 64);
    };
}

export function loadEventPayoutCompleted(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3516491073) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _value = sc_0.loadCoins();
    let _nonce = sc_0.loadUintBig(64);
    let _payout_id = sc_0.loadUintBig(64);
    return { $$type: 'EventPayoutCompleted' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id };
}

function loadTupleEventPayoutCompleted(source: TupleReader) {
    let _address = source.readAddress();
    let _value = source.readBigNumber();
    let _nonce = source.readBigNumber();
    let _payout_id = source.readBigNumber();
    return { $$type: 'EventPayoutCompleted' as const, address: _address, value: _value, nonce: _nonce, payout_id: _payout_id };
}

function storeTupleEventPayoutCompleted(source: EventPayoutCompleted) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.value);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.payout_id);
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
}

export function storeWithdrawTicketContent(src: WithdrawTicketContent) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1763882716, 32);
        b_0.storeAddress(src.address);
        b_0.storeUint(src.value, 64);
        b_0.storeUint(src.nonce, 64);
        b_0.storeUint(src.expire, 64);
        b_0.storeUint(src.payout_id, 64);
    };
}

export function loadWithdrawTicketContent(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1763882716) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _value = sc_0.loadUintBig(64);
    let _nonce = sc_0.loadUintBig(64);
    let _expire = sc_0.loadUintBig(64);
    let _payout_id = sc_0.loadUintBig(64);
    return { $$type: 'WithdrawTicketContent' as const, address: _address, value: _value, nonce: _nonce, expire: _expire, payout_id: _payout_id };
}

function loadTupleWithdrawTicketContent(source: TupleReader) {
    let _address = source.readAddress();
    let _value = source.readBigNumber();
    let _nonce = source.readBigNumber();
    let _expire = source.readBigNumber();
    let _payout_id = source.readBigNumber();
    return { $$type: 'WithdrawTicketContent' as const, address: _address, value: _value, nonce: _nonce, expire: _expire, payout_id: _payout_id };
}

function storeTupleWithdrawTicketContent(source: WithdrawTicketContent) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.value);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.expire);
    builder.writeNumber(source.payout_id);
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
        b_0.storeUint(838693908, 32);
        b_0.store(storeWithdrawTicketContent(src.ticket));
        b_0.storeRef(src.signature);
    };
}

export function loadWithdrawTicket(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 838693908) { throw Error('Invalid prefix'); }
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

 type PayoutsMaster_init_args = {
    $$type: 'PayoutsMaster_init_args';
    owner: Address;
    publicKey: bigint;
}

function initPayoutsMaster_init_args(src: PayoutsMaster_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeInt(src.publicKey, 257);
    };
}

async function PayoutsMaster_init(owner: Address, publicKey: bigint) {
    const __code = Cell.fromBase64('te6ccgECNQEACacAART/APSkE/S88sgLAQIBYgIDAt7QAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zxVEts88uCCyPhDAcx/AcoAVSBaINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WEsv/ygDJ7VQSBAIBIAUGA/btou37AZIwf+BwIddJwh+VMCDXCx/eIMAAItdJwSGwklt/4CCCEDH9dBS64wIgghChFkBpuo67MNMfAYIQoRZAabry4IH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfoA0z/TP1UwbBTbPH/gIIIQQokDwroYGRoCASAHCAIBIA4PAhG6F72zzbPGwxgSCQIBSAoLAAIgAhGxR3bPNs8bDGASDAIRsH42zzbPGwxgEg0AAiIAAiECASAQEQIBSBYXAk22byQa6TAgIXdeXBEEGuFhRBAgn/deWhEwYTdeXBEbZ4qgW2eNhjASEwHdt3owTgudh6ullc9j0J2HOslQo2zQThO6xqWlbI+WZFp15b++LEcwTgQKuANwDOxymcsHVcjktlhwTgN6k73yqLLeOOp6e8CrOGTQThOy6ctWadluZ0HSzbKM3RSQTggZzq084r86ShYDrC3EyPZQFQHW7UTQ1AH4Y9IAAY4o+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHT/9IAVSBsE+D4KNcLCoMJuvLgifpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgBgQEB1wBZAtEB2zwUAZD4Q/goEts8cFnIcAHLAXMBywFwAcsAEszMyfkAyHIBywFwAcsAEsoHy//J0CDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgeAAJwAEiCcKPpAvltgVQjou8Eds5r0cuCcJEwaGam6KQ2fuBHvgVRj4kAEbCvu1E0NIAAYAB1sm7jQ1aXBmczovL1FtWWFja1RjRjZMSHNiRk1wTURCSkt6VEpUVGp6V3FuNlRiZWJ3MkR3cEhRaTGCABnjDTHwGCEDH9dBS68uCB0x8BghBpIrbcuvLggfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB0z/TP9M/0z9VQAXUAdAWbBbbPH8bA/ZGVNs8+EP4KFJQ2zxwWchwAcsBcwHLAXABywASzMzJ+QDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiIERTfhBbyQQI18DEscF8vSBSwT4J28Q+EFvJBNfA6GCEEGQqwApoLzy9CNURzYvHh8E/o9KMNMfAYIQQokDwrry4IH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfoA0z/TP1UwbBRfA3CAQIhBMH9EFFAzbW3bPH/gIIIQlGqYtrqOqDDTHwGCEJRqmLa68uCB0z8BMcgBghCv+Q9XWMsfyz/J+EIBcG3bPH8hMzIiAvZIdts8+EFvJDCBPrszghA7msoAvhLy9FQ2VFO6yFVAghBpIrbcUAbLH1AEINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WEss/yz/LP8s/yfkAgURBCvgjvhry9AiCAL0RUXL5EBby9IIA4eIjgggPQkC+8vSBSwQvHAK6+CdvEIIQQZCrACWgvPL0+EP4KFJQ2zxccFnIcAHLAXMBywFwAcsAEszMyfkAyHIBywFwAcsAEsoHy//J0CDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgQNkVIHh0BgMhVMIIQVxuYlFAFyx9QAyDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFgH6Ass/yz/JAn8CbwJeIxA02zwyANYC0PQEMG0BgVvnAYAQ9A9vofLghwGBW+ciAoAQ9BfIAcj0AMkBzHABygBAA1kg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxYBINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyQK8F8hVMIIQ0ZllQVAFyx9QAyDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFgH6Ass/yz/JyIJYwAAAAAAAAAAAAAAAAQHLZ8zJcPsAgECIEDZBYH9EFFAzbW3bPCAzACoAAAAAUGF5b3V0INGBb21wbGV0ZWQAIAAAAABBbHJlYWR5IHBhaWQBEODAAJEw4w1wIwP++QEggvAZ3C3Txjb0G1gXzb74oqq3ZWA/sC2pKcFnoF+OkSbeX7qUMH/bMeAggvAtyxmluJ250zd/xlHG+ba5Lbm+YkBgxipQVyzcl5aGOLqPKzD4QW8kMIE+uzOCEDuaygC+EvL0ghAF9eEAcnCIEDQQI0RAE21t2zx/2zHgICQzJQAoAAAAAERlcG9zaXQgcmVjZWl2ZWQEzoLwJQt24rlXb8a0xFEpSDAGsAA6DDm2965BPRd/TjR528q6j50w2zyCEAX14QBw+wJwgwZwiCZZREATbW3bPH/bMeAggvCYbCuhJLuSh+tKC9jTEE4cAGejyTlS2InHTQgYW9MNTbouJjMnACwAAAAAV2l0aGRyYXcgY29tcGxldGVkBHiPlTDbPHCBAKBwiCZZREATbW3bPH/bMeAggvBsj0T0X+20zf7U3o2xSqWxOtVdQw91nQZpIQt0xI/j37ouKDMpACwAAAAAQ29udHJhY3QgZGVzdHJveWVkAmiOhjDbPH/bMeCC8Lz693aQfHGcyNN52PGUqqon6Moocc1ZF4FyHyFaRUUBuo6F2zx/2zHgKisEDts82zwwcIguLC0xBA7bPNs8MH+ILi8wMQAOggDQMCHy9AAWAAAAAFJlc3VtZWQAEvhCUjDHBfLghAAQggCdsCGz8vQAFgAAAABTdG9wcGVkAQ74QgF/bds8MgKSbW0ibrOZWyBu8tCAbyIBkTLi+EFvJBNfA/gnbxABoYIQBfXhALmOlYIQBfXhAHD7AhAkcAMEgQCCUCPbPOAQJHADBIBCUCPbPDMzAcrIcQHKAVAHAcoAcAHKAlAFINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAP6AnABymgjbrORf5MkbrPilzMzAXABygDjDSFus5x/AcoAASBu8tCAAcyVMXABygDiyQH7ADQAmH8BygDIcAHKAHABygAkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDiJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4nABygACfwHKAALJWMw=');
    const __system = Cell.fromBase64('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');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initPayoutsMaster_init_args({ $$type: 'PayoutsMaster_init_args', owner, publicKey })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const PayoutsMaster_errors: { [key: number]: { message: string } } = {
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
    19204: { message: `Insufficient balance on master` },
    40368: { message: `Contract stopped` },
    48401: { message: `Invalid signature` },
    53296: { message: `Contract not stopped` },
    57826: { message: `Check withdraw min value` },
}

const PayoutsMaster_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounced","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"TryPayout","header":1461426324,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"payout_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"PayoutOk","header":2702590057,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"payout_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"PayoutFailed","header":1116275650,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"payout_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"EventPayoutCompleted","header":3516491073,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"payout_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"WithdrawTicketContent","header":1763882716,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"expire","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"payout_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"WithdrawTicket","header":838693908,"fields":[{"name":"ticket","type":{"kind":"simple","type":"WithdrawTicketContent","optional":false}},{"name":"signature","type":{"kind":"simple","type":"slice","optional":false}}]},
]

const PayoutsMaster_getters: ABIGetter[] = [
    {"name":"publicKey","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_wallet_address","arguments":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"owner","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"stopped","arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
]

const PayoutsMaster_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"text","text":"deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"WithdrawTicket"}},
    {"receiver":"internal","message":{"kind":"typed","type":"PayoutOk"}},
    {"receiver":"internal","message":{"kind":"typed","type":"PayoutFailed"}},
    {"receiver":"internal","message":{"kind":"text","text":"Deposit"}},
    {"receiver":"internal","message":{"kind":"text","text":"Withdraw"}},
    {"receiver":"internal","message":{"kind":"text","text":"Destroy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"text","text":"Resume"}},
    {"receiver":"internal","message":{"kind":"text","text":"Stop"}},
]

export class PayoutsMaster implements Contract {
    
    static async init(owner: Address, publicKey: bigint) {
        return await PayoutsMaster_init(owner, publicKey);
    }
    
    static async fromInit(owner: Address, publicKey: bigint) {
        const init = await PayoutsMaster_init(owner, publicKey);
        const address = contractAddress(0, init);
        return new PayoutsMaster(address, init);
    }
    
    static fromAddress(address: Address) {
        return new PayoutsMaster(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  PayoutsMaster_types,
        getters: PayoutsMaster_getters,
        receivers: PayoutsMaster_receivers,
        errors: PayoutsMaster_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | 'deploy' | WithdrawTicket | PayoutOk | PayoutFailed | 'Deposit' | 'Withdraw' | 'Destroy' | Deploy | 'Resume' | 'Stop') {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message === 'deploy') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawTicket') {
            body = beginCell().store(storeWithdrawTicket(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PayoutOk') {
            body = beginCell().store(storePayoutOk(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PayoutFailed') {
            body = beginCell().store(storePayoutFailed(message)).endCell();
        }
        if (message === 'Deposit') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === 'Withdraw') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === 'Destroy') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message === 'Resume') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === 'Stop') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getPublicKey(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('publicKey', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getGetWalletAddress(provider: ContractProvider, owner: Address) {
        let builder = new TupleBuilder();
        builder.writeAddress(owner);
        let source = (await provider.get('get_wallet_address', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('owner', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
    async getStopped(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('stopped', builder.build())).stack;
        let result = source.readBoolean();
        return result;
    }
    
}