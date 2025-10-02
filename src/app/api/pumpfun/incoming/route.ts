import { NextResponse } from "next/server";

import { PUMPFUN_INCOMING_SAMPLE } from "@/data/pumpFunIncomingSample";
import { type PumpFunProject } from "@/types/pumpfun";

const INCOMING_LIMIT = 20;

const PUMP_FUN_INCOMING_URL =
  `https://frontend-api-v3.pump.fun/api/projects/incoming-bonding?limit=${INCOMING_LIMIT}`;

const parseNullableNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return null;
};

const parseNullableString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeProgress = (value: number | null): number | null => {
  if (value === null) {
    return null;
  }
  if (value <= 1) {
    return Math.max(0, Math.min(value, 1));
  }
  if (value <= 100) {
    return Math.max(0, Math.min(value / 100, 1));
  }
  return 1;
};

const normalizeProject = (raw: unknown, index: number): PumpFunProject => {
  const record = (raw ?? {}) as Record<string, unknown>;
  const metadata = (record.metadata ?? record.meta ?? {}) as Record<string, unknown>;
  const metrics = (record.metrics ?? record.data ?? {}) as Record<string, unknown>;
  const bonding = (record.bondingCurve ?? record.bonding ?? record.progress ?? {}) as Record<
    string,
    unknown
  >;
  const socials = (record.socials ?? record.links ?? {}) as Record<string, unknown>;

  const idCandidate =
    record.id ??
    record.mint ??
    record.address ??
    record.publicKey ??
    record.pubkey ??
    record.projectId ??
    `project-${index + 1}`;

  const createdAtCandidate =
    (record.createdAt as string | undefined) ??
    (record.created_at as string | undefined) ??
    (metrics.createdAt as string | undefined) ??
    (metrics.created_at as string | undefined) ??
    null;

  const nameCandidate =
    parseNullableString(metadata.name) ?? parseNullableString(record.name) ?? "";
  const symbolCandidate =
    parseNullableString(metadata.symbol) ?? parseNullableString(record.symbol) ?? "";
  const imageCandidate =
    parseNullableString(metadata.image) ??
    parseNullableString(metadata.imageUrl) ??
    parseNullableString(metadata.imageURI) ??
    parseNullableString(metadata.imageUri) ??
    parseNullableString(metadata.image_uri) ??
    parseNullableString(metadata.image_url) ??
    parseNullableString(metadata.logo) ??
    parseNullableString(metadata.icon) ??
    parseNullableString(record.image) ??
    parseNullableString(record.imageUrl) ??
    parseNullableString(record.imageURI) ??
    parseNullableString(record.imageUri) ??
    parseNullableString(record.image_uri) ??
    parseNullableString(record.image_url) ??
    parseNullableString(record.logo) ??
    parseNullableString(record.icon) ??
    null;

  const price =
    parseNullableNumber(record.priceUsd) ??
    parseNullableNumber(record.price_usd) ??
    parseNullableNumber(metrics.priceUsd) ??
    parseNullableNumber(metrics.price_usd) ??
    parseNullableNumber(record.price);

  const marketCap =
    parseNullableNumber(record.marketCapUsd) ??
    parseNullableNumber(record.market_cap_usd) ??
    parseNullableNumber(record.market_cap) ??
    parseNullableNumber(metrics.marketCapUsd) ??
    parseNullableNumber(metrics.market_cap_usd) ??
    parseNullableNumber(metrics.market_cap) ??
    parseNullableNumber(bonding.marketCapUsd);

  const liquidity =
    parseNullableNumber(record.liquidityUsd) ??
    parseNullableNumber(record.liquidity_usd) ??
    parseNullableNumber(metrics.liquidityUsd) ??
    parseNullableNumber(metrics.liquidity_usd) ??
    parseNullableNumber(metrics.liquidity);

  const raised =
    parseNullableNumber(record.raisedUsd) ??
    parseNullableNumber(record.raised_usd) ??
    parseNullableNumber(bonding.raisedUsd) ??
    parseNullableNumber(bonding.raised_usd) ??
    parseNullableNumber(metrics.raisedUsd);

  const targetMarketCap =
    parseNullableNumber(bonding.targetMarketCapUsd) ??
    parseNullableNumber(bonding.target_market_cap_usd) ??
    parseNullableNumber(record.targetMarketCapUsd) ??
    parseNullableNumber(record.target_market_cap_usd);

  const progress = normalizeProgress(
    parseNullableNumber(record.bondingProgress) ??
      parseNullableNumber(record.bonding_progress) ??
      parseNullableNumber(bonding.progress) ??
      parseNullableNumber(bonding.progressPercent) ??
      parseNullableNumber(bonding.progressPercentage) ??
      parseNullableNumber(record.progress) ??
      parseNullableNumber(metrics.bondingProgress) ??
      parseNullableNumber(record.progress_to_bonding_curve),
  );

  const holders =
    parseNullableNumber(record.holders) ??
    parseNullableNumber(record.holderCount) ??
    parseNullableNumber(record.holder_count) ??
    parseNullableNumber(metrics.holders) ??
    parseNullableNumber(metrics.uniqueHolders) ??
    parseNullableNumber(metrics.holderCount);

  const twitter =
    (socials.twitter as string | undefined) ??
    (metadata.twitter as string | undefined) ??
    (record.twitter as string | undefined) ??
    null;
  const telegram =
    (socials.telegram as string | undefined) ??
    (metadata.telegram as string | undefined) ??
    (record.telegram as string | undefined) ??
    null;
  const website =
    (socials.website as string | undefined) ??
    (metadata.website as string | undefined) ??
    (record.website as string | undefined) ??
    null;

  return {
    id: String(idCandidate),
    name: nameCandidate || "", 
    symbol: symbolCandidate || "",
    image: imageCandidate ?? null,
    priceUsd: price,
    marketCapUsd: marketCap,
    liquidityUsd: liquidity,
    bondingProgress: progress,
    bondingMarketCapTargetUsd: targetMarketCap,
    raisedUsd: raised,
    holders: holders,
    createdAt: createdAtCandidate,
    twitter,
    telegram,
    website,
  };
};

const sortProjects = (projects: PumpFunProject[]): PumpFunProject[] =>
  projects
    .slice()
    .sort((a, b) => {
      const progressA = a.bondingProgress ?? -1;
      const progressB = b.bondingProgress ?? -1;

      if (progressB !== progressA) {
        return progressB - progressA;
      }

      const raisedA = a.raisedUsd ?? a.marketCapUsd ?? a.liquidityUsd ?? 0;
      const raisedB = b.raisedUsd ?? b.marketCapUsd ?? b.liquidityUsd ?? 0;

      if (raisedB !== raisedA) {
        return raisedB - raisedA;
      }

      return (b.holders ?? 0) - (a.holders ?? 0);
    });

export const runtime = "nodejs";

export async function GET() {
  const headers = new Headers({
    Accept: "application/json",
  });

  const username = process.env.PUMPFUN_API_USERNAME;
  const password = process.env.PUMPFUN_API_PASSWORD;

  if (username && password) {
    const token = Buffer.from(`${username}:${password}`).toString("base64");
    headers.set("Authorization", `Basic ${token}`);
  }

  let remoteProjects: PumpFunProject[] | null = null;
  let errorMessage: string | undefined;

  try {
    const response = await fetch(PUMP_FUN_INCOMING_URL, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      errorMessage = `Remote request failed with status ${response.status}`;
    } else {
      const payload = await response.json();
      const collection = Array.isArray(payload)
        ? payload
        : (payload.projects ?? payload.items ?? payload.data ?? payload.result ?? payload.results ?? []);

      if (Array.isArray(collection) && collection.length > 0) {
        remoteProjects = collection
          .map((item, index) => normalizeProject(item, index))
          .filter((project) => project.name.trim().length > 0);

        if (remoteProjects.length === 0) {
          errorMessage = "Remote source returned no recognizable projects";
        }
      } else {
        errorMessage = "Remote source returned no projects";
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "Unknown error fetching Pump.fun projects";
    }
  }

  if (remoteProjects && remoteProjects.length > 0) {
    return NextResponse.json({
      projects: sortProjects(remoteProjects).slice(0, INCOMING_LIMIT),
      source: "remote",
    });
  }

  return NextResponse.json(
    {
      projects: sortProjects(PUMPFUN_INCOMING_SAMPLE).slice(0, INCOMING_LIMIT),
      source: "fallback",
      error: errorMessage,
    },
    { status: 200 },
  );
}
