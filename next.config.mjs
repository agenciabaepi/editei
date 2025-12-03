/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for @imgly/background-removal and onnxruntime-web
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      // Handle .wasm files
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
      
      // Ignore onnxruntime-web files that use import.meta (they're loaded dynamically)
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /node_modules[\\/]onnxruntime-web[\\/].*\.m?js$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/chunks/[name][ext]',
        },
      });
    }
    return config;
  },
};

export default nextConfig;
