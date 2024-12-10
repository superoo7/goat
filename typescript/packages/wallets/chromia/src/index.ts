import {
    DictPair,
    IClient,
    Operation,
    QueryObject,
    RawGtv,
    SignatureProvider,
    SignedTransaction,
    Transaction,
} from "postchain-client";
import { Balance, Connection } from "@chromia/ft4";

export enum CHROMIA_MAINNET_BRID {
    ECONOMY_CHAIN = "15C0CA99BEE60A3B23829968771C50E491BD00D2E3AE448580CD48A8D71E7BBA",
}
export const CHR_ASSET_ID =
    "5f16d1545a0881f971b164f1601cbbf51c29efd0633b2730da18c403c3b428b5";

export type ChromiaWalletOptions = {
    client: IClient;
    signatureProvider: SignatureProvider;
    connection: Connection;
};

export function chromia({
    client,
    signatureProvider,
    connection,
}: ChromiaWalletOptions) {
    return {
        getAddress: () => signatureProvider.pubKey.toString("hex"),
        getChain(): { type: "chromia" } {
            return {
                type: "chromia",
            };
        },
        async signMessage(message: string) {
            const signature = await client.signTransaction(
                {
                    operations: [
                        {
                            name: "signMessage",
                            args: [Buffer.from(message)],
                        },
                    ],
                    signers: [signatureProvider.pubKey],
                },
                signatureProvider
            );
            return { signature: signature.toString("hex") };
        },
        async sendTransaction(transaction: Operation | Transaction) {
            return client.signAndSendUniqueTransaction(
                transaction,
                signatureProvider
            );
        },
        async read(nameOrQueryObject: string | QueryObject<RawGtv | DictPair>) {
            return client.query(nameOrQueryObject);
        },
        async balanceOf(address: string) {
            const account = await connection.getAccountById(address);
            if (account) {
                const balance = await account.getBalanceByAssetId(CHR_ASSET_ID);
                if (balance) {
                    return {
                        decimals: balance.asset.decimals,
                        symbol: balance.asset.symbol,
                        name: balance.asset.name,
                        value: BigInt(balance.amount.value),
                    };
                }
            }
            return {
                decimals: 0,
                symbol: "CHR",
                name: "Chromia",
                value: BigInt(0),
            };
        },
    };
}
