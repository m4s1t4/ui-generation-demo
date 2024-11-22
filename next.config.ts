import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  },
};

export default nextConfig;
