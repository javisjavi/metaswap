import { NextRequest, NextResponse } from "next/server";

import { JUPITER_SWAP_URL } from "@/config/jupiter";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const upstreamUrl = new URL(JUPITER_SWAP_URL);
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
    const body = await request.text();
    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body,
    });

    const payload = await response.text();

    if (!response.ok) {
      return new NextResponse(payload || "Failed to create swap transaction", {
        status: response.status,
      });
    }

    return new NextResponse(payload, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error requesting Jupiter swap transaction", error);
    return NextResponse.json(
      { error: "Unable to reach Jupiter swap service" },
      { status: 502 }
    );
  }
}
