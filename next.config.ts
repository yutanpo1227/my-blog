import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [process.env.VERCEL_URL!, "localhost"],
  },
};

export default nextConfig;
