import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co', // Spotify
      },
      {
        protocol: 'https',
        hostname: 'trddkrtwxykzrjzrgrex.supabase.co', // Supabase
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
