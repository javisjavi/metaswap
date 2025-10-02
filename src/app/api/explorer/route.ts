import { Connection, PublicKey, type ParsedAccountData } from "@solana/web3.js";
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
} from "@/types/explorer";

export const runtime = "nodejs";

const DEFAULT_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const RPC_ENDPOINT =
  process.env.SOLANA_RPC_ENDPOINT ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT ??
  DEFAULT_RPC_ENDPOINT;

const connection = new Connection(RPC_ENDPOINT, "confirmed");

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;
const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

const fetchTokenHoldings = async (owner: PublicKey): Promise<ExplorerTokenHolding[]> => {
  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(
      owner,
      { programId: TOKEN_PROGRAM_ID },
      "confirmed",
    );

    const holdings = accounts
      .map(({ pubkey, account }) => {
        const data = account.data as ParsedAccountData;
        if (typeof data !== "object" || data === null || data.program !== "spl-token") {
          return null;
        }

        const parsed = data.parsed as { type: string; info?: Record<string, unknown> };
        if (parsed?.type !== "account" || !parsed.info) {
          return null;
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
          return null;
        }

        try {
          if (BigInt(amount) === BigInt(0)) {
            return null;
          }
        } catch {
          return null;
        }

        return {
          mint,
          tokenAccount: pubkey.toBase58(),
          amount,
          uiAmountString: tokenAmount?.uiAmountString ?? null,
          decimals,
        } satisfies ExplorerTokenHolding;
      })
      .filter((holding): holding is ExplorerTokenHolding => holding !== null);

    return holdings;
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

  const accountKeys = data?.transaction.message.accountKeys.map((key) =>
    key.toBase58(),
  );

  const instructions = accountKeys
    ? data?.transaction.message.instructions.map((instruction) =>
        buildInstruction(accountKeys, instruction),
      ) ?? []
    : [];

  const signers = accountKeys
    ? accountKeys.slice(0, data?.transaction.message.header.numRequiredSignatures ?? 0)
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
        const rentEpoch = parsedInfo.value.rentEpoch;
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
