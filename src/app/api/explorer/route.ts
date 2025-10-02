import {
  Connection,
  PublicKey,
  type ParsedAccountData,
  type Message,
} from "@solana/web3.js";
import { NextResponse } from "next/server";

import {
  type ExplorerAccountResult,
  type ExplorerAccountType,
  type ExplorerApiResponse,
  type ExplorerTokenAccountInfo,
  type ExplorerTokenMintInfo,
  type ExplorerTransactionInstruction,
  type ExplorerTransactionResult,
  type ExplorerTokenHolding,
  type ExplorerTokenMetadata,
} from "@/types/explorer";
import { HELIUS_MAINNET_ENDPOINT } from "@/utils/solanaEndpoints";

export const runtime = "nodejs";

const DEFAULT_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const RPC_ENDPOINT =
  process.env.SOLANA_RPC_ENDPOINT ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT ??
  DEFAULT_RPC_ENDPOINT;

const connection = new Connection(RPC_ENDPOINT, "confirmed");

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;
const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";
const TOKEN_PROGRAM_IDS = [
  new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  new PublicKey("TokenzQdBNbLqJX7dpUz3W11afV53EREMAtZ7ED6SmY"),
] as const;

const HELIUS_ASSETS_ENDPOINT = HELIUS_MAINNET_ENDPOINT;
const HELIUS_ASSET_BATCH_SIZE = 100;

type HeliusAsset = {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
      description?: string;
    } | null;
    links?: {
      image?: string;
      external?: string;
      external_url?: string;
      website?: string;
    } | null;
  } | null;
  token_info?: {
    symbol?: string;
  } | null;
} | null;

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const mapAssetToMetadata = (asset: HeliusAsset): ExplorerTokenMetadata | null => {
  if (!asset || !asset.id) {
    return null;
  }

  const symbol = asset.token_info?.symbol ?? asset.content?.metadata?.symbol ?? null;
  const name = asset.content?.metadata?.name ?? null;
  const description = asset.content?.metadata?.description ?? null;
  const logoURI = asset.content?.links?.image ?? null;
  const website =
    asset.content?.links?.website ??
    asset.content?.links?.external_url ??
    asset.content?.links?.external ??
    null;

  if (!symbol && !name && !logoURI && !description && !website) {
    return null;
  }

  return {
    symbol,
    name,
    description,
    logoURI,
    website,
  } satisfies ExplorerTokenMetadata;
};

const fetchTokenMetadata = async (
  mints: string[],
): Promise<Map<string, ExplorerTokenMetadata>> => {
  const metadata = new Map<string, ExplorerTokenMetadata>();

  if (!mints.length || !HELIUS_ASSETS_ENDPOINT) {
    return metadata;
  }

  const uniqueMints = Array.from(new Set(mints));

  for (const batch of chunkArray(uniqueMints, HELIUS_ASSET_BATCH_SIZE)) {
    try {
      const response = await fetch(HELIUS_ASSETS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0" as const,
          id: `explorer-token-${Date.now()}`,
          method: "getAssets" as const,
          params: {
            ids: batch,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Helius responded with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        result?: HeliusAsset[] | null;
        error?: { message?: string } | null;
      };

      if (payload.error?.message) {
        throw new Error(payload.error.message);
      }

      for (const asset of payload.result ?? []) {
        const mapped = mapAssetToMetadata(asset);
        if (asset?.id && mapped) {
          metadata.set(asset.id, mapped);
        }
      }
    } catch (error) {
      console.error(
        "Explorer token metadata lookup failed",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return metadata;
};

const hasLegacyMessageShape = (
  message: unknown,
): message is {
  accountKeys: PublicKey[];
  instructions: { programIdIndex: number; accounts: number[]; data: string }[];
  header: { numRequiredSignatures: number };
} => {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const candidate = message as Record<string, unknown>;
  const accountKeys = candidate.accountKeys;
  const instructions = candidate.instructions;
  const header = candidate.header as { numRequiredSignatures?: unknown } | undefined;

  return (
    Array.isArray(accountKeys) &&
    Array.isArray(instructions) &&
    typeof header?.numRequiredSignatures === "number"
  );
};

const canDecompileToLegacyMessage = (
  message: unknown,
): message is { decompileToLegacyMessage: () => Message } =>
  typeof message === "object" &&
  message !== null &&
  typeof (message as { decompileToLegacyMessage?: unknown }).decompileToLegacyMessage === "function";

const fetchTokenHoldings = async (owner: PublicKey): Promise<ExplorerTokenHolding[]> => {
  try {
    const programResults = await Promise.allSettled(
      TOKEN_PROGRAM_IDS.map((programId) =>
        connection.getParsedTokenAccountsByOwner(owner, { programId }, "confirmed"),
      ),
    );

    const accounts = programResults.flatMap((result) => {
      if (result.status === "fulfilled") {
        return result.value.value ?? [];
      }

      console.error(
        "Explorer token holdings lookup failed for program",
        result.reason instanceof Error ? result.reason.message : result.reason,
      );
      return [];
    });

    const holdings = accounts.reduce<ExplorerTokenHolding[]>((acc, { pubkey, account }) => {
      const data = account.data as ParsedAccountData;
      if (typeof data !== "object" || data === null || data.program !== "spl-token") {
        return acc;
      }

      const parsed = data.parsed as { type: string; info?: Record<string, unknown> };
      if (parsed?.type !== "account" || !parsed.info) {
        return acc;
      }

      const info = parsed.info as {
        tokenAmount?: {
          amount?: string;
          decimals?: number;
          uiAmountString?: string | null;
        };
        mint?: string;
      };

      const tokenAmount = info.tokenAmount;
      const mint = typeof info.mint === "string" ? info.mint : null;
      const amount = tokenAmount?.amount;
      const decimals = tokenAmount?.decimals;

      if (!mint || !amount || decimals === undefined) {
        return acc;
      }

      try {
        if (BigInt(amount) === BigInt(0)) {
          return acc;
        }
      } catch {
        return acc;
      }

      acc.push({
        mint,
        tokenAccount: pubkey.toBase58(),
        amount,
        uiAmountString: tokenAmount?.uiAmountString ?? null,
        decimals,
        metadata: null,
      });

      return acc;
    }, []);

    if (!holdings.length) {
      return holdings;
    }

    const metadataMap = await fetchTokenMetadata(holdings.map((holding) => holding.mint));

    return holdings.map((holding) => ({
      ...holding,
      metadata: metadataMap.get(holding.mint) ?? null,
    }));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Explorer token holdings lookup failed", error.message);
    }
    return [];
  }
};

const createAccountResult = (
  address: string,
  info: ParsedAccountData | Buffer,
  owner: string,
  lamports: number,
  executable: boolean,
  rentEpoch: number,
  dataLength: number | null,
): ExplorerAccountResult => {
  let accountType: ExplorerAccountType = executable ? "program" : "unknown";
  let tokenMintInfo: ExplorerTokenMintInfo | null = null;
  let tokenAccountInfo: ExplorerTokenAccountInfo | null = null;

  if (owner === SYSTEM_PROGRAM_ID && !executable) {
    accountType = "wallet";
  }

  const isParsedData = (value: unknown): value is ParsedAccountData =>
    typeof value === "object" && value !== null && "program" in value;

  if (isParsedData(info)) {
    const { program, parsed, space } = info;

    if (typeof space === "number" && dataLength === null) {
      dataLength = space;
    }

    if (program === "spl-token" && parsed?.type === "mint") {
      accountType = "tokenMint";
      const mintInfo = parsed.info as {
        supply: string;
        decimals: number;
        mintAuthority: string | null;
        freezeAuthority: string | null;
        isInitialized: boolean;
      };

      tokenMintInfo = {
        supply: mintInfo.supply,
        decimals: mintInfo.decimals,
        mintAuthority: mintInfo.mintAuthority,
        freezeAuthority: mintInfo.freezeAuthority,
        isInitialized: mintInfo.isInitialized,
      };
    } else if (program === "spl-token" && parsed?.type === "account") {
      accountType = "tokenAccount";
      const accountInfo = parsed.info as {
        mint: string;
        owner: string;
        state: string;
        delegate: string | null;
        tokenAmount: {
          amount: string;
          decimals: number;
          uiAmountString: string | null;
        };
      };

      tokenAccountInfo = {
        mint: accountInfo.mint,
        owner: accountInfo.owner,
        state: accountInfo.state,
        delegate: accountInfo.delegate,
        amount: accountInfo.tokenAmount.amount,
        uiAmountString: accountInfo.tokenAmount.uiAmountString,
        decimals: accountInfo.tokenAmount.decimals,
      };
    } else if (program === "system" && !executable) {
      accountType = "wallet";
    }
  }

  return {
    kind: "account",
    address,
    owner,
    lamports,
    executable,
    rentEpoch,
    dataLength,
    accountType,
    tokenMintInfo,
    tokenAccountInfo,
    tokenHoldings: [],
  };
};

const buildInstruction = (
  accountKeys: string[],
  instruction: { programIdIndex: number; accounts: number[]; data: string },
): ExplorerTransactionInstruction => {
  const programId = accountKeys[instruction.programIdIndex] ?? "Unknown";

  return {
    programId,
    accounts: instruction.accounts.map((index) => accountKeys[index] ?? "Unknown"),
    dataLength: instruction.data.length,
  };
};

const createTransactionResult = (
  signature: string,
  data: Awaited<ReturnType<typeof connection.getTransaction>>,
): ExplorerTransactionResult => {
  const slot = data?.slot ?? 0;
  const blockTime = data?.blockTime ?? null;
  const err = data?.meta?.err ?? null;
  const success = err === null;
  const error = err ? JSON.stringify(err) : null;
  const fee = data?.meta?.fee ?? null;
  const computeUnitsConsumed = data?.meta?.computeUnitsConsumed ?? null;
  const logMessages = data?.meta?.logMessages ?? null;

  const transactionMessage = data?.transaction.message;
  let legacyMessage: Message | null = null;

  if (hasLegacyMessageShape(transactionMessage)) {
    legacyMessage = transactionMessage as Message;
  } else if (canDecompileToLegacyMessage(transactionMessage)) {
    try {
      legacyMessage = transactionMessage.decompileToLegacyMessage();
    } catch (messageError) {
      console.error("Explorer legacy message conversion failed", messageError);
      legacyMessage = null;
    }
  }

  const accountKeys = legacyMessage
    ? legacyMessage.accountKeys.map((key) => key.toBase58())
    : [];

  const instructions = legacyMessage
    ? legacyMessage.instructions.map((instruction) => buildInstruction(accountKeys, instruction))
    : [];

  const signers = legacyMessage
    ? accountKeys.slice(0, legacyMessage.header.numRequiredSignatures)
    : [];

  return {
    kind: "transaction",
    signature,
    slot,
    blockTime,
    success,
    error,
    fee,
    computeUnitsConsumed,
    instructions,
    logMessages,
    signers,
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json(
        { error: "missing_query" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (!BASE58_REGEX.test(query)) {
      return NextResponse.json(
        { error: "invalid_query" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    let accountResult: ExplorerAccountResult | null = null;

    try {
      const publicKey = new PublicKey(query);
      const [parsedInfo, rawInfo] = await Promise.all([
        connection.getParsedAccountInfo(publicKey, "confirmed"),
        connection.getAccountInfo(publicKey, "confirmed"),
      ]);

      if (parsedInfo.value) {
        const dataLength = rawInfo?.data.length ?? null;
        const owner = parsedInfo.value.owner.toBase58();
        const lamports = parsedInfo.value.lamports;
        const executable = parsedInfo.value.executable;
        const rentEpoch = parsedInfo.value.rentEpoch ?? 0;
        const accountData = parsedInfo.value.data as ParsedAccountData | Buffer;

        accountResult = createAccountResult(
          query,
          accountData,
          owner,
          lamports,
          executable,
          rentEpoch,
          dataLength,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Explorer account lookup failed", error.message);
      }
    }

    if (accountResult) {
      if (accountResult.accountType === "wallet") {
        try {
          const walletKey = new PublicKey(accountResult.address);
          const tokenHoldings = await fetchTokenHoldings(walletKey);
          accountResult = { ...accountResult, tokenHoldings };
        } catch (error) {
          if (error instanceof Error) {
            console.error("Explorer wallet holdings enrichment failed", error.message);
          }
        }
      }
      const payload: ExplorerApiResponse = { result: accountResult };
      return NextResponse.json(payload, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    try {
      const transaction = await connection.getTransaction(query, {
        maxSupportedTransactionVersion: 0,
      });

      if (transaction) {
        const result = createTransactionResult(query, transaction);
        const payload: ExplorerApiResponse = { result };
        return NextResponse.json(payload, {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Explorer transaction lookup failed", error.message);
      }
    }

    return NextResponse.json(
      { error: "not_found" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Explorer API request failed", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
