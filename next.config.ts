import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',  // ← Cloudflare R2
      },
      {
        protocol: 'https',
        hostname: '*.fal.ai',  // ← fal.ai images
      },
      {
        protocol: 'https',
        hostname: '*.fal.run', // ← fal.ai aussi
      },
    ],
  },
}

export default nextConfig;