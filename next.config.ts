import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  env: {
    NEXTAUTH_SECRET: "law-firm-secret-key-change-in-production-2024",
    NEXTAUTH_URL: "https://law-firm-era.vercel.app",
  },
};

export default nextConfig;
