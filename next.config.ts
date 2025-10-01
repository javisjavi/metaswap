import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "pump.mypinata.cloud",
      },
      {
        protocol: "https",
        hostname: "cf-ipfs.com",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
    ],
  },
};

export default nextConfig;
