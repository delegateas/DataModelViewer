const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: path.join(__dirname, '..'),
  },
}

module.exports = nextConfig