export const formatLamports = (
  raw: string | bigint,
  decimals: number,
  precision = 6
): string => {
  const value = typeof raw === "bigint" ? raw : BigInt(raw);
  if (decimals === 0) {
    return value.toString();
  }
  const base = BigInt(10) ** BigInt(decimals);
  const whole = value / base;
  const fraction = value % base;
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  const fractionStr = fraction
    .toString()
    .padStart(decimals, "0")
    .slice(0, precision)
    .replace(/0+$/, "");
  return fractionStr ? `${whole.toString()}.${fractionStr}` : whole.toString();
};

export const parseAmountToLamports = (
  value: string,
  decimals: number
): bigint | null => {
  const sanitized = value.trim();
  if (!sanitized) {
    return null;
  }
  if (!/^\d*(\.\d*)?$/.test(sanitized)) {
    return null;
  }
  const [wholePart, fractionalPart = ""] = sanitized.split(".");
  if (!wholePart && !fractionalPart) {
    return null;
  }

  const safeFraction = fractionalPart.slice(0, decimals);
  const paddedFraction = safeFraction.padEnd(decimals, "0");
  const combined = `${wholePart || "0"}${paddedFraction}`.replace(/^0+(?=\d)/, "");

  try {
    return BigInt(combined || "0");
  } catch {
    return null;
  }
};

export const formatNumber = (value: number, maximumFractionDigits = 4): string =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
