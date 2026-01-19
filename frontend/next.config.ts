import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error - turbopack options are valid at runtime but missing from types
    turbopack: {
      // Silence warning about multiple lockfiles by explicitly setting the root
      root: path.resolve(__dirname, '..'),
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
};

export default nextConfig;
