/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tripflow/shared'],
  async rewrites() {
    const backendUrl = (
      process.env.API_URL || 'http://localhost:3001'
    ).replace(/\/+$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
