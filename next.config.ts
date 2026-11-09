import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Portfolio covers can be pasted in from any HTTPS host or Vercel Blob.
    // The optimizer still resizes/compresses them; SVG stays blocked by default.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
