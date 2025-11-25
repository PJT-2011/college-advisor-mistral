/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    // Handle node-llama-cpp ESM module
    if (isServer) {
      config.externals = [...(config.externals || []), 
        { 'node-llama-cpp': 'commonjs node-llama-cpp' }
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
