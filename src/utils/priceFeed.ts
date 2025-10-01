const PRICE_FEED_URL = "https://price.jup.ag/v4/price";
const CACHE_TTL_MS = 60_000;

type CacheEntry = {
  price: number;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<number | null>>();

const isValidPrice = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
};

const fetchPriceFromApi = async (id: string): Promise<number | null> => {
  const url = new URL(PRICE_FEED_URL);
  url.searchParams.set("ids", id);

  const fetchFn: typeof fetch | undefined =
    typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : undefined;

  if (!fetchFn) {
    return null;
  }

  try {
    const response = await fetchFn(url.toString(), {
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      data?: Record<string, { price?: number }>;
    };

    const price = payload?.data?.[id]?.price;
    if (!isValidPrice(price)) {
      return null;
    }

    cache.set(id, { price, expiresAt: Date.now() + CACHE_TTL_MS });
    return price;
  } catch (error) {
    return null;
  }
};

export const getCachedTokenPriceUsd = async (id: string): Promise<number | null> => {
  const cached = cache.get(id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.price;
  }

  let request = pendingRequests.get(id);
  if (!request) {
    request = fetchPriceFromApi(id).finally(() => {
      pendingRequests.delete(id);
    });
    pendingRequests.set(id, request);
  }

  return request;
};

export const setCachedTokenPriceUsd = (id: string, price: number, ttlMs = CACHE_TTL_MS) => {
  if (!isValidPrice(price)) {
    return;
  }

  cache.set(id, { price, expiresAt: Date.now() + Math.max(ttlMs, 0) });
};

export type { CacheEntry };
