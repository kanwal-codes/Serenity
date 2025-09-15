/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    // Disable TypeScript completely
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  // Ensure we're using JavaScript
  experimental: {
    typedRoutes: false,
  }
};

module.exports = nextConfig;

