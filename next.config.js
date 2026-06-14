/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "localhost" }],
        destination: "http://127.0.0.1:3000/:path*",
        permanent: false,
      },
    ];
  },
  typescript: {
    // Disable TypeScript completely
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

