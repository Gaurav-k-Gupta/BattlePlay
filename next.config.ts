import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.50.42.119'],
  experimental: {
    // Next 16's CLI type-check path is not compatible with the local npm wrapper.
    useTypeScriptCli: false,
  },
};

export default withPWA(nextConfig);
