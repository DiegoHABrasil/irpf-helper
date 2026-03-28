/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'tesseract.js'],
  },
  webpack: (config) => {
    // Required for pdf-parse
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig
