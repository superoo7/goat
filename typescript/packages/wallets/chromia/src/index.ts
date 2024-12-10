import {
    DictPair,
    IClient,
    QueryObject,
    RawGtv,
    SignatureProvider,
} from "postchain-client";
import {
    Connection,
    createAmount,
    createInMemoryFtKeyStore,
    createKeyStoreInteractor,
    KeyStoreInteractor,
    Session,
} from "@chromia/ft4";

export enum CHROMIA_MAINNET_BRID {
    ECONOMY_CHAIN = "15C0CA99BEE60A3B23829968771C50E491BD00D2E3AE448580CD48A8D71E7BBA",
}
export const CHR_ASSET_ID =
    "5f16d1545a0881f971b164f1601cbbf51c29efd0633b2730da18c403c3b428b5";

export type ChromiaWalletOptions = {
    client: IClient;
    keystore?: KeyStoreInteractor;
    keystoreAddress?: string;
    signatureProvider?: SignatureProvider;
    connection: Connection;
};

export type ChromiaTransaction = {
    to: string;
    assetId: string;
    amount: string;
};

export function chromia({
    client,
    keystore,
    keystoreAddress,
    signatureProvider,
    connection,
}: ChromiaWalletOptions) {
    return {
        getAddress: () => {
            if (signatureProvider) {
                return signatureProvider.pubKey.toString("hex");
            } else if (keystore) {
                return keystoreAddress || "";
            }
            return "";
        },
        getChain(): { type: "chromia" } {
            return {
                type: "chromia",
            };
        },
        async signMessage(message: string) {
            if (signatureProvider) {
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
            } else if (keystore) {
                // TODO: Implement keystore signing
                return { signature: "" };
            }
            return { signature: "" };
        },
        async sendTransaction({ to, assetId, amount }: ChromiaTransaction) {
            let session: Session;
            if (signatureProvider) {
                const { getSession } = createKeyStoreInteractor(
                    client,
                    createInMemoryFtKeyStore(signatureProvider)
                );
                session = await getSession(
                    signatureProvider.pubKey.toString("hex")
                );
            } else if (keystore) {
                const accounts = await keystore.getAccounts();
                session = await keystore.getSession(accounts[0].id);
            } else {
                throw new Error("No signature provider or keystore provided");
            }
            const asset = await connection.getAssetById(assetId);
            if (!asset) {
                throw new Error("Asset not found");
            }
            const amountToSend = createAmount(amount, asset.decimals);
            return await session.account.transfer(to, assetId, amountToSend);
        },
        async read(nameOrQueryObject: string | QueryObject<RawGtv | DictPair>) {
            return client.query(nameOrQueryObject);
        },
        async balanceOf(address: string) {
            const account = await connection.getAccountById(address);
            if (account) {
                const balance = await account.getBalanceByAssetId(CHR_ASSET_ID);
                if (balance) {
                    console.log(balance);
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
