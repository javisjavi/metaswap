import { NextRequest, NextResponse } from "next/server";

import { JUPITER_QUOTE_URL } from "@/config/jupiter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const upstreamUrl = new URL(JUPITER_QUOTE_URL);
  const searchParams = request.nextUrl.searchParams;

  searchParams.forEach((value, key) => {
    if (value != null) {
      upstreamUrl.searchParams.set(key, value);
    }
  });

  if (!upstreamUrl.searchParams.has("cluster")) {
    upstreamUrl.searchParams.set("cluster", "mainnet-beta");
  }

  try {
    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    const payload = await response.text();

    if (!response.ok) {
      return new NextResponse(payload || "Failed to fetch quote", {
        status: response.status,
      });
    }

    return new NextResponse(payload, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching Jupiter quote", error);
    return NextResponse.json(
      { error: "Unable to reach Jupiter quote service" },
      { status: 502 }
    );
  }
}
