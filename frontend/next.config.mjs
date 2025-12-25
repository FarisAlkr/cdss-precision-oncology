/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only add rewrites if API URL is defined (for local development)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Skip rewrites if no API URL is configured
    if (!apiUrl) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
}

export default nextConfig
