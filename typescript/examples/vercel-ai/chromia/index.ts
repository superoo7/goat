import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { createClient, newSignatureProvider } from "postchain-client";
import { CHROMIA_MAINNET_BRID, chromia } from "@goat-sdk/wallet-chromia";
import { createConnection, createGenericEvmKeyStore, createKeyStoreInteractor } from "@chromia/ft4";
import { sendCHR } from "@goat-sdk/core";

require("dotenv").config();

const privateKey = process.env.CHROMIA_PRIVATE_KEY;

if (!privateKey) {
    throw new Error("CHROMIA_PRIVATE_KEY is not set in the environment");
}

(async () => {
    const chromiaClient = await createClient({
        nodeUrlPool: ["https://system.chromaway.com:7740"],
        blockchainRid: CHROMIA_MAINNET_BRID.ECONOMY_CHAIN
    });
    const connection = createConnection(chromiaClient);
    const signatureProvider = newSignatureProvider({
        privKey: Buffer.from(privateKey, "hex"),
    });
    console.log("PUBKEY: ", signatureProvider.pubKey.toString("hex"));

    const tools = await getOnChainTools({
        wallet: chromia({
            client: chromiaClient,
            signatureProvider,
            connection
        }),
        plugins: [
            sendCHR()
        ],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "send 0.0001 CHR to <recipient_address>",
    });

    console.log(result.text);
})();
