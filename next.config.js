/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,       // helps catch potential bugs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.dev.to',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'media2.dev.to',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
