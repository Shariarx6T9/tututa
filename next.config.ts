import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    reactCompiler: true,
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "127.0.0.1" },
    ],
  },
  // Allow large response streaming
  serverExternalPackages: ["pdf-parse", "sharp"],
};

export default nextConfig;
