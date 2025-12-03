/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar SWC minify para arquivos .mjs (causa problemas com import.meta)
  swcMinify: false,
  
  // Headers necessários para WebAssembly
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
            value: 'credentialless',
          },
        ],
      },
    ];
  },
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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for potential Node.js modules in browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      // Configure experiments for WebAssembly (needed for onnxruntime-web)
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
      
      // Handle .wasm files - serve them as assets
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
      });
      
      // Configurar Terser para excluir arquivos .mjs (contêm import.meta)
      // Isso evita erros de sintaxe durante a minificação
      if (config.optimization) {
        config.optimization.minimizer = config.optimization.minimizer || [];
        const TerserPlugin = require('terser-webpack-plugin');
        const terserIndex = config.optimization.minimizer.findIndex(
          plugin => plugin && plugin.constructor && plugin.constructor.name === 'TerserPlugin'
        );
        if (terserIndex !== -1) {
          const existingOptions = config.optimization.minimizer[terserIndex].options || {};
          config.optimization.minimizer[terserIndex] = new TerserPlugin({
            ...existingOptions,
            exclude: /\.mjs$/,
          });
        }
      }
    } else {
      // Server-side: Ensure bcryptjs is external and not bundled
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        if (!config.externals.includes('bcryptjs')) {
          config.externals.push('bcryptjs');
        }
      } else if (typeof config.externals === 'object') {
        config.externals.bcryptjs = 'commonjs bcryptjs';
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          (context, request, callback) => {
            if (request === 'bcryptjs') {
              return callback(null, 'commonjs bcryptjs');
            }
            originalExternals(context, request, callback);
          }
        ];
      }
    }
    return config;
  },
};

export default nextConfig;
