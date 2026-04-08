/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  webSocketPort: 3000,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  devIndicators: false,
};

module.exports = nextConfig;
