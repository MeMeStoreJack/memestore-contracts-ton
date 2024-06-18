import base64url from "base64url";
import { randomBytes } from "crypto";
import { Address, beginCell } from "@ton/core";
import { keyPairFromSeed, sign } from "ton-crypto";
import { WithdrawTicket, WithdrawTicketContent, loadWithdrawTicket, storeWithdrawTicket, storeWithdrawTicketContent} from "./output/JettonPayouts_JettonPayoutsMaster";

import {WithdrawTicket as PayoutsWithdrawTicket, WithdrawTicketContent as PayoutsWithdrawTicketContent, storeWithdrawTicketContent as payoutsStoreWithdrawTicketContent} from './output/Payouts_PayoutsMaster'

export function createUniqTicket(address: Address, amount: bigint, nonce: bigint, expire: bigint, payout_id: bigint, secretKey: Buffer) {
    let content: PayoutsWithdrawTicketContent = {
        $$type: "WithdrawTicketContent",
        address: address,
        value: amount,
        nonce: nonce,
        expire: expire,
        payout_id: payout_id,
    };
    let ticket: PayoutsWithdrawTicket = {
        "$$type": "WithdrawTicket",
        ticket: content,
        signature: beginCell().endCell(),
    };
    ticket.signature = signTonWithdrawContent(content, secretKey);
    return ticket;
}

// Jetton Payouts
export function createWithdrawTicketMsg(address: Address, amount: bigint, nonce: bigint, expire: bigint, payout_id: bigint, user_jetton_wallet: Address, secretKey: Buffer) {
    let content: WithdrawTicketContent = {
        $$type: "WithdrawTicketContent",
        address: address,
        value: amount,
        nonce: nonce,
        expire: expire,
        payout_id: payout_id,
        jetton_wallet: user_jetton_wallet,
    };
    let ticket: WithdrawTicket = {
        "$$type": "WithdrawTicket",
        ticket: content,
        signature: beginCell().endCell(),
    };
    ticket.signature = signWithdrawContent(content, secretKey);
    return ticket;
}

export function signWithdrawContent(content: WithdrawTicketContent, secretKey: Buffer) {
    let ticketHash = beginCell().store(storeWithdrawTicketContent(content)).endCell().hash();
    let signature = sign(ticketHash, secretKey);
    return beginCell().storeBuffer(signature).endCell();
}

// TON Payouts
export function createTonWithdrawTicketMsg(address: Address, amount: bigint, nonce: bigint, expire: bigint, payout_id: bigint, secretKey: Buffer) {
    let content: PayoutsWithdrawTicketContent = {
        $$type: "WithdrawTicketContent",
        address: address,
        value: amount,
        nonce: nonce,
        expire: expire,
        payout_id: payout_id,
    };
    let ticket: PayoutsWithdrawTicket = {
        "$$type": "WithdrawTicket",
        ticket: content,
        signature: beginCell().endCell(),
    };
    ticket.signature = signTonWithdrawContent(content, secretKey);
    console.log(`ticket.signature: ${ticket.signature.toBoc().toString("hex")}`)
    return ticket;
}

export function signTonWithdrawContent(content: PayoutsWithdrawTicketContent, secretKey: Buffer) {
    let ticketHash = beginCell().store(payoutsStoreWithdrawTicketContent(content)).endCell().hash();
    let signature = sign(ticketHash, secretKey);
    return beginCell().storeBuffer(signature).endCell();
}