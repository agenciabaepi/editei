/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure server-only packages are not bundled
  serverComponentsExternalPackages: ['bcryptjs'],
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
