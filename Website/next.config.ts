/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Ensure static files are properly handled in standalone mode
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./public/**/*'],
    },
  },
  // Configure the standalone build to include static assets
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Add this to ensure proper static file handling
  trailingSlash: false,
  // Configure asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
}

module.exports = nextConfig