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

export type NewReferrer = {
    $$type: 'NewReferrer';
    referrer: Address;
}

export function storeNewReferrer(src: NewReferrer) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3048483276, 32);
        b_0.storeAddress(src.referrer);
    };
}

export function loadNewReferrer(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3048483276) { throw Error('Invalid prefix'); }
    let _referrer = sc_0.loadAddress();
    return { $$type: 'NewReferrer' as const, referrer: _referrer };
}

function loadTupleNewReferrer(source: TupleReader) {
    let _referrer = source.readAddress();
    return { $$type: 'NewReferrer' as const, referrer: _referrer };
}

function storeTupleNewReferrer(source: NewReferrer) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.referrer);
    return builder.build();
}

function dictValueParserNewReferrer(): DictionaryValue<NewReferrer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNewReferrer(src)).endCell());
        },
        parse: (src) => {
            return loadNewReferrer(src.loadRef().beginParse());
        }
    }
}

export type NewReferrerInternal = {
    $$type: 'NewReferrerInternal';
    sender: Address;
    referrer: Address;
}

export function storeNewReferrerInternal(src: NewReferrerInternal) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(335613664, 32);
        b_0.storeAddress(src.sender);
        b_0.storeAddress(src.referrer);
    };
}

export function loadNewReferrerInternal(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 335613664) { throw Error('Invalid prefix'); }
    let _sender = sc_0.loadAddress();
    let _referrer = sc_0.loadAddress();
    return { $$type: 'NewReferrerInternal' as const, sender: _sender, referrer: _referrer };
}

function loadTupleNewReferrerInternal(source: TupleReader) {
    let _sender = source.readAddress();
    let _referrer = source.readAddress();
    return { $$type: 'NewReferrerInternal' as const, sender: _sender, referrer: _referrer };
}

function storeTupleNewReferrerInternal(source: NewReferrerInternal) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.sender);
    builder.writeAddress(source.referrer);
    return builder.build();
}

function dictValueParserNewReferrerInternal(): DictionaryValue<NewReferrerInternal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNewReferrerInternal(src)).endCell());
        },
        parse: (src) => {
            return loadNewReferrerInternal(src.loadRef().beginParse());
        }
    }
}

export type ReferrerNotification = {
    $$type: 'ReferrerNotification';
    sender: Address;
    referrer: Address;
}

export function storeReferrerNotification(src: ReferrerNotification) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1557780044, 32);
        b_0.storeAddress(src.sender);
        b_0.storeAddress(src.referrer);
    };
}

export function loadReferrerNotification(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1557780044) { throw Error('Invalid prefix'); }
    let _sender = sc_0.loadAddress();
    let _referrer = sc_0.loadAddress();
    return { $$type: 'ReferrerNotification' as const, sender: _sender, referrer: _referrer };
}

function loadTupleReferrerNotification(source: TupleReader) {
    let _sender = source.readAddress();
    let _referrer = source.readAddress();
    return { $$type: 'ReferrerNotification' as const, sender: _sender, referrer: _referrer };
}

function storeTupleReferrerNotification(source: ReferrerNotification) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.sender);
    builder.writeAddress(source.referrer);
    return builder.build();
}

function dictValueParserReferrerNotification(): DictionaryValue<ReferrerNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeReferrerNotification(src)).endCell());
        },
        parse: (src) => {
            return loadReferrerNotification(src.loadRef().beginParse());
        }
    }
}

export type ReferrerSetEvent = {
    $$type: 'ReferrerSetEvent';
    owner: Address;
    referrer: Address;
}

export function storeReferrerSetEvent(src: ReferrerSetEvent) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2740046754, 32);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.referrer);
    };
}

export function loadReferrerSetEvent(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2740046754) { throw Error('Invalid prefix'); }
    let _owner = sc_0.loadAddress();
    let _referrer = sc_0.loadAddress();
    return { $$type: 'ReferrerSetEvent' as const, owner: _owner, referrer: _referrer };
}

function loadTupleReferrerSetEvent(source: TupleReader) {
    let _owner = source.readAddress();
    let _referrer = source.readAddress();
    return { $$type: 'ReferrerSetEvent' as const, owner: _owner, referrer: _referrer };
}

function storeTupleReferrerSetEvent(source: ReferrerSetEvent) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.referrer);
    return builder.build();
}

function dictValueParserReferrerSetEvent(): DictionaryValue<ReferrerSetEvent> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeReferrerSetEvent(src)).endCell());
        },
        parse: (src) => {
            return loadReferrerSetEvent(src.loadRef().beginParse());
        }
    }
}

 type ReferrerParent_init_args = {
    $$type: 'ReferrerParent_init_args';
}

function initReferrerParent_init_args(src: ReferrerParent_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
    };
}

async function ReferrerParent_init() {
    const __code = Cell.fromBase64('te6ccgECHAEABcoAART/APSkE/S88sgLAQIBYgIDApjQAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zxZ2zzy4ILI+EMBzH8BygABAcv/ye1UFQQCASAPEATq7aLt+wGSMH/gcCHXScIflTAg1wsf3iDAACLXScEhsJJbf+AgghC1tCnMuo6xMNMfAYIQtbQpzLry4IH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIMds8f+AgghBc2dZMuuMCIIIQlGqYtrrjAsAABQYHCALggU5t+EIixwWz8vSCAN+C+EFvJBNfA4IQBfXhAL7y9AGk+EP4KPhC2zxccFnIcAHLAXMBywFwAcsAEszMyfkAyHIBywFwAcsAEsoHy//J0CDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4Ih/+EJQBhQJAaYw0x8BghBc2dZMuvLggfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBJsEts8fwoBUDDTHwGCEJRqmLa68uCB0z8BMcgBghCv+Q9XWMsfyz/J+EIBcG3bPH8MAGCOKvkBgvAZ3C3Txjb0G1gXzb74oqq3ZWA/sC2pKcFnoF+OkSbeX7qTf9sx4JEw4nABwMhZghAUAQ7gUAPLHwEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxYBINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyRQQNYIQBfXhAFpyUHIQVhA0ECPbPA0CpvhD+Cgj2zxwWchwAcsBcwHLAXABywASzMzJ+QDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiIIA0r/4QhLHBfL0FAsAxshZghCjUcuiUAPLHwEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxYBINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyciCWMAAAAAAAAAAAAAAAAEBy2fMyXD7AAE6bW0ibrOZWyBu8tCAbyIBkTLiECRwAwSAQlAj2zwNAcrIcQHKAVAHAcoAcAHKAlAFINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAP6AnABymgjbrORf5MkbrPilzMzAXABygDjDSFus5x/AcoAASBu8tCAAcyVMXABygDiyQH7AA4AmH8BygDIcAHKAHABygAkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDiJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4nABygACfwHKAALJWMwCASAREgIBIBgZAkm7sxINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiNs8Ads8MYFRMCD7jJfbPNs8MYFRYBkPhD+ChY2zxwWchwAcsBcwHLAXABywASzMzJ+QDIcgHLAXABywASygfL/8nQINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBQA2gLQ9AQwbQGCAP+cAYAQ9A9vofLghwGCAP+cIgKAEPQXyAHI9ADJAcxwAcoAQANZINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFskBPO1E0NQB+GPSAAGU0/8BMeAw+CjXCwqDCbry4InbPBcAAiAAAnAAubu9GCcFzsPV0srnsehOw51kqFG2aCcJ3WNS0rZHyzItOvLf3xYjmCcCBVwBuAZ2OUzlg6rkclssOCcBvUne+VRZbxx1PT3gVZwyaCcJ2XTlqzTstzOg6WbZRm6KSAIBSBobABGwr7tRNDSAAGAAdbJu40NWlwZnM6Ly9RbVZnRkYyTnZUM3FhcmdydEh5ZVBrVmc4RHAxQ2F6VkU2OVR4c1N3QVJFYm1ogg');
    const __system = Cell.fromBase64('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');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initReferrerParent_init_args({ $$type: 'ReferrerParent_init_args' })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const ReferrerParent_errors: { [key: number]: { message: string } } = {
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
    3222: { message: `not parent` },
    20077: { message: `self referrer` },
    53951: { message: `fake child` },
    57218: { message: `not enough value` },
}

const ReferrerParent_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounced","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"NewReferrer","header":3048483276,"fields":[{"name":"referrer","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"NewReferrerInternal","header":335613664,"fields":[{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"referrer","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ReferrerNotification","header":1557780044,"fields":[{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"referrer","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ReferrerSetEvent","header":2740046754,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"referrer","type":{"kind":"simple","type":"address","optional":false}}]},
]

const ReferrerParent_getters: ABIGetter[] = [
    {"name":"seqno","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"childAddress","arguments":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"address","optional":false}},
]

const ReferrerParent_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"text","text":"deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"NewReferrer"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ReferrerNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]

export class ReferrerParent implements Contract {
    
    static async init() {
        return await ReferrerParent_init();
    }
    
    static async fromInit() {
        const init = await ReferrerParent_init();
        const address = contractAddress(0, init);
        return new ReferrerParent(address, init);
    }
    
    static fromAddress(address: Address) {
        return new ReferrerParent(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ReferrerParent_types,
        getters: ReferrerParent_getters,
        receivers: ReferrerParent_receivers,
        errors: ReferrerParent_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | 'deploy' | NewReferrer | ReferrerNotification | Deploy) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message === 'deploy') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'NewReferrer') {
            body = beginCell().store(storeNewReferrer(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ReferrerNotification') {
            body = beginCell().store(storeReferrerNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getSeqno(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('seqno', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getChildAddress(provider: ContractProvider, owner: Address) {
        let builder = new TupleBuilder();
        builder.writeAddress(owner);
        let source = (await provider.get('childAddress', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
}