
import { DictPair, Operation, QueryObject, RawGtv, Transaction, TransactionReceipt } from "postchain-client";
import type { WalletClient } from "./core";

export function isChromiaWalletClient(wallet: WalletClient): wallet is ChromiaWalletClient {
    return wallet.getChain().type === "chromia";
}

export type ChromiaTransaction = Operation | Transaction;

export type ChromiaReadRequest =  string | QueryObject<RawGtv | DictPair>;

export type ChromiaReadResult = RawGtv;

export type ChromiaTransactionResult = TransactionReceipt;

export interface ChromiaWalletClient extends WalletClient {
    sendTransaction: (transaction: ChromiaTransaction) => Promise<ChromiaTransactionResult>;
    read: (request: ChromiaReadRequest) => Promise<ChromiaReadResult>;
}
