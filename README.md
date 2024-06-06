# MeMe Store contracts in Tact

This repository contains the smart contracts for the MeMe Store platform, divided into three main functionalities outlined below.

- Issuing MEME jettons and adding liquidity, which can be done through the FairMint or BondingCurve methods
- Referrer Relationship Contract, setting up user on-chain referrer relationships
- Referrer Rewards Contract, claiming referrer rewards via the referrer rewards contract

## MEME Jettons Contract

### FairMint Method

The jetton issuer specifies the mint price, quantity, and target amount.
Once the specified quantity is reached, liquidity is added to a third-party swap platform. Currently, ston.fi is supported.

### BondingCurve Method

The jetton issuer specifies the Bonding Curve parameters, allowing users to buy and sell on the Bonding Curve.
When the conditions set by the jetton issuer for adding liquidity are met, liquidity is added to a third-party swap platform. Currently, ston.fi is supported.

## Referrer Relationship Contract
Users set their referrer, which is used for backend indexing to query user referrer relationships. This is used for distributing referrer fees when users buy or sell jettons. The fees are claimed through the referrer rewards contract.

## Referrer Rewards Contract
The backend calculates the referrer rewards a user is entitled to through the referrer relationship contract and provides the claim signature information. Users send this signature to the referrer rewards contract to claim their rewards.

## Usage

```bash
yarn build # To build & compile the contract
yarn test # To run test cases for the contract
yarn deploy # To deploy contract
```

🔍 Detail can be found in `package.json` LOL

## Reference

-   https://blog.ton.org/how-to-shard-your-ton-smart-contract-and-why-studying-the-anatomy-of-tons-jettons
-   https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
-   https://docs.ton.org/develop/dapps/asset-processing/jettons
-   https://docs.tact-lang.org/learn/jetton/jetton-3

## Licence

MIT
