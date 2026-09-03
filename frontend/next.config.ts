/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Recharts v3 uses ESM-only imports that Turbopack needs to transpile
  transpilePackages: ['recharts'],
};

export default nextConfig;
