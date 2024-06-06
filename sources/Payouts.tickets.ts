import base64url from "base64url";
import { randomBytes } from "crypto";
import { Address, beginCell } from "@ton/core";
import { keyPairFromSeed, sign } from "ton-crypto";

export function createUniqTicket(address: Address, amount: bigint, nonce: bigint, expire: bigint, payout_id: bigint, secretKey: Buffer) {
    let msgHash = beginCell().storeAddress(address).storeCoins(amount).storeUint(nonce, 64).storeUint(expire, 64).storeUint(payout_id, 64).endCell().hash();
    let signature = sign(msgHash, secretKey);
    let builder = beginCell().storeBuffer(signature).storeCoins(amount).storeUint(nonce, 64).storeUint(expire, 64).storeUint(payout_id, 64);
    while ((1023 - builder.availableBits) % 8 !== 0) {
        builder.storeBit(0);
    }
    let c = builder.endCell();
    let signatureWithPadding = c.beginParse().loadBuffer(c.bits.length / 8);
    return base64url(signatureWithPadding);
}