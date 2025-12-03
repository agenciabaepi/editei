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
      
      // Note: onnxruntime-web is loaded dynamically via import() in use-remove-bg.ts
      // The .mjs files use import.meta which webpack can't process, but since
      // they're loaded dynamically, webpack doesn't need to bundle them
      // The module will be available at runtime from node_modules
    }
    return config;
  },
};

export default nextConfig;
