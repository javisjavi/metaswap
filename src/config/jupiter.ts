const DEFAULT_JUPITER_API_BASE_URL = "https://quote-api.jup.ag";

export const JUPITER_API_BASE_URL =
  process.env.NEXT_PUBLIC_JUPITER_API_BASE_URL?.replace(/\/$/, "") ||
  DEFAULT_JUPITER_API_BASE_URL;

export const JUPITER_QUOTE_URL = `${JUPITER_API_BASE_URL}/v6/quote`;
export const JUPITER_SWAP_URL = `${JUPITER_API_BASE_URL}/v6/swap`;
