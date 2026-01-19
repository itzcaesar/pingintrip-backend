import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  // Silence warning about multiple lockfiles by explicitly setting the root
  turbopack: {
    root: path.resolve(__dirname, '..'),
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
