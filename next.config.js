/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
