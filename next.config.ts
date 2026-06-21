import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "127.0.0.1" },
    ],
  },
  serverExternalPackages: ["pdf-parse", "sharp"],
};

export default nextConfig;