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

 type ReferrerChild_init_args = {
    $$type: 'ReferrerChild_init_args';
    parent: Address;
    owner: Address;
}

function initReferrerChild_init_args(src: ReferrerChild_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.parent);
        b_0.storeAddress(src.owner);
    };
}

async function ReferrerChild_init(parent: Address, owner: Address) {
    const __code = Cell.fromBase64('te6ccgECFgEABDgAART/APSkE/S88sgLAQIBYgIDA3rQAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zxVEts88uCCEAQFAgEgCQoB9AGSMH/gcCHXScIflTAg1wsf3iDAACLXScEhsJJbf+CCEBQBDuC6js/THwGCEBQBDuC68uCB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIEmwS4DBwBgDWyPhDAcx/AcoAVSBaINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WWCDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFgEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJ7VQB4DKBDJb4QlJQxwWUUzHHBZFw4vL0IchZghBc2dZMUAPLHwEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxYBINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyVIwggr68IByfwQDbW3bPH8HAcrIcQHKAVAHAcoAcAHKAlAFINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAP6AnABymgjbrORf5MkbrPilzMzAXABygDjDSFus5x/AcoAASBu8tCAAcyVMXABygDiyQH7AAgAmH8BygDIcAHKAHABygAkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDiJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4nABygACfwHKAALJWMwCEb4o7tnm2eNhjBALAgEgDA0AAiECAVgODwIBSBQVAhGzhrbPNs8bDGAQEQC5svRgnBc7D1dLK57HoTsOdZKhRtmgnCd1jUtK2R8syLTry398WI5gnAgVcAbgGdjlM5YOq5HJbLDgnAb1J3vlUWW8cdT094FWcMmgnCdl05as07LczoOlm2UZuikgAfbtRNDUAfhj0gABjmP6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiEMwbBPg+CjXCwqDCbry4IkSAAIgAYr6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgSAtEB2zwTAFxwIMhyAcsBcAHLABLKB8v/ydAg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIABGwr7tRNDSAAGAAdbJu40NWlwZnM6Ly9RbVBTcHZ4YjZYVDdHR1J0WlZYOGppck10QVNHczEyMlZQV1h3UWVMUk0yaW0zgg');
    const __system = Cell.fromBase64('te6cckECGAEABEIAAQHAAQEFof85AgEU/wD0pBP0vPLICwMCAWIECgN60AHQ0wMBcbCjAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IhUUFMDbwT4YQL4Yts8VRLbPPLgghAFCQH0AZIwf+BwIddJwh+VMCDXCx/eIMAAItdJwSGwklt/4IIQFAEO4LqOz9MfAYIQFAEO4Lry4IH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgSbBLgMHAGAeAygQyW+EJSUMcFlFMxxwWRcOLy9CHIWYIQXNnWTFADyx8BINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFslSMIIK+vCAcn8EA21t2zx/BwHKyHEBygFQBwHKAHABygJQBSDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFlAD+gJwAcpoI26zkX+TJG6z4pczMwFwAcoA4w0hbrOcfwHKAAEgbvLQgAHMlTFwAcoA4skB+wAIAJh/AcoAyHABygBwAcoAJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4iRus51/AcoABCBu8tCAUATMljQDcAHKAOJwAcoAAn8BygACyVjMANbI+EMBzH8BygBVIFog10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZYINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFsntVAIBIAsNAhG+KO7Z5tnjYYwQDAACIQIBIA4VAgFYDxQCEbOGts82zxsMYBATAfbtRNDUAfhj0gABjmP6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiEMwbBPg+CjXCwqDCbry4IkRAYr6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgSAtEB2zwSAFxwIMhyAcsBcAHLABLKB8v/ydAg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAAIgALmy9GCcFzsPV0srnsehOw51kqFG2aCcJ3WNS0rZHyzItOvLf3xYjmCcCBVwBuAZ2OUzlg6rkclssOCcBvUne+VRZbxx1PT3gVZwyaCcJ2XTlqzTstzOg6WbZRm6KSACAUgWFwARsK+7UTQ0gABgAHWybuNDVpcGZzOi8vUW1QU3B2eGI2WFQ3R0dSdFpWWDhqaXJNdEFTR3MxMjJWUFdYd1FlTFJNMmltM4IOL5goY=');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initReferrerChild_init_args({ $$type: 'ReferrerChild_init_args', parent, owner })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const ReferrerChild_errors: { [key: number]: { message: string } } = {
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

const ReferrerChild_types: ABIType[] = [
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

const ReferrerChild_getters: ABIGetter[] = [
    {"name":"owner","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"referrer","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

const ReferrerChild_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"NewReferrerInternal"}},
]

export class ReferrerChild implements Contract {
    
    static async init(parent: Address, owner: Address) {
        return await ReferrerChild_init(parent, owner);
    }
    
    static async fromInit(parent: Address, owner: Address) {
        const init = await ReferrerChild_init(parent, owner);
        const address = contractAddress(0, init);
        return new ReferrerChild(address, init);
    }
    
    static fromAddress(address: Address) {
        return new ReferrerChild(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ReferrerChild_types,
        getters: ReferrerChild_getters,
        receivers: ReferrerChild_receivers,
        errors: ReferrerChild_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | NewReferrerInternal) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'NewReferrerInternal') {
            body = beginCell().store(storeNewReferrerInternal(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getOwner(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('owner', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
    async getReferrer(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('referrer', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
}