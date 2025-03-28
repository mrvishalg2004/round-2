/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure TypeScript errors don't fail build in production
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable eslint during build for now
    ignoreDuringBuilds: true,
  },
  // Custom webpack config for socket.io support
  webpack: (config) => {
    config.externals = [...config.externals, { bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" }];
    return config;
  },
};

export default nextConfig; 