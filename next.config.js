/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/admin",
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dogsmwhda/**",
      },
    ],
  },
  experimental: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
