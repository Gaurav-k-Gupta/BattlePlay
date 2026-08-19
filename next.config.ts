import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next 16's CLI type-check path is not compatible with the local npm wrapper.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
