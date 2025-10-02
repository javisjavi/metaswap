export type ExplorerAccountType =
  | "wallet"
  | "program"
  | "tokenMint"
  | "tokenAccount"
  | "unknown";

export type ExplorerTokenMintInfo = {
  supply: string;
  decimals: number;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  isInitialized: boolean;
};

export type ExplorerTokenAccountInfo = {
  mint: string;
  owner: string;
  state: string;
  amount: string;
  uiAmountString: string | null;
  decimals: number;
  delegate: string | null;
};

export type ExplorerTokenHolding = {
  mint: string;
  tokenAccount: string;
  amount: string;
  uiAmountString: string | null;
  decimals: number;
};

export type ExplorerAccountResult = {
  kind: "account";
  address: string;
  owner: string;
  lamports: number;
  executable: boolean;
  rentEpoch: number;
  dataLength: number | null;
  accountType: ExplorerAccountType;
  tokenMintInfo: ExplorerTokenMintInfo | null;
  tokenAccountInfo: ExplorerTokenAccountInfo | null;
  tokenHoldings: ExplorerTokenHolding[];
};

export type ExplorerTransactionInstruction = {
  programId: string;
  accounts: string[];
  dataLength: number;
};

export type ExplorerTransactionResult = {
  kind: "transaction";
  signature: string;
  slot: number;
  blockTime: number | null;
  success: boolean;
  error: string | null;
  fee: number | null;
  computeUnitsConsumed: number | null;
  instructions: ExplorerTransactionInstruction[];
  logMessages: string[] | null;
  signers: string[];
};

export type ExplorerResult = ExplorerAccountResult | ExplorerTransactionResult;

export type ExplorerApiResponse = {
  result: ExplorerResult;
};
