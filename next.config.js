/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["chromadb"],
  },
};

module.exports = nextConfig;
