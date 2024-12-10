# Goat Wallet Chromia 🐐 - TypeScript

## Installation
```
npm install @goat-sdk/wallet-chromia
```

## Usage

### With Chromia Native Wallet

[Installation Guide](https://docs.chromia.com/intro/installation/cli-installation)

```sh
# To create a new wallet from Chromia CHR CLI
chr keygen
```

```typescript
import { createClient, newSignatureProvider } from "postchain-client";
import { CHROMIA_MAINNET_BRID, chromia } from "@goat-sdk/wallet-chromia";
import { createConnection } from "@chromia/ft4";
import { sendCHR } from "@goat-sdk/core";

const chromiaClient = await createClient({
    nodeUrlPool: ["https://system.chromaway.com:7740"],
    blockchainRid: CHROMIA_MAINNET_BRID.ECONOMY_CHAIN
});
const connection = createConnection(chromiaClient);
const signatureProvider = newSignatureProvider({
    privKey: Buffer.from(privateKey, "hex"),
});

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
```

### With EVM Wallet
WIP