/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@ghxstship/config"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Increase static generation timeout for large page counts
  staticPageGenerationTimeout: 180,
  // Experimental settings for better build performance
  experimental: {
    // Reduce memory pressure during builds
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
