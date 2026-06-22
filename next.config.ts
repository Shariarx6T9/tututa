import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    unoptimized: true,          // ← fixes local /public images on Vercel
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "127.0.0.1" },
    ],
  },
  serverExternalPackages: ["pdf-parse", "sharp"],
};

export default nextConfig;