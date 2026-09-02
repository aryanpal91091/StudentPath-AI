/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Recharts v3 uses ESM-only imports that Turbopack needs to transpile
  transpilePackages: ['recharts'],
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
  },
};

export default nextConfig;
