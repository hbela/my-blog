import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Google user avatars (OAuth profile pictures)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // GitHub avatars
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        // General wildcard for any https images you add via URL in posts/projects
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
