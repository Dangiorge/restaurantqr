/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    agentUpgrade: 'security',
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Local /public images only; Cloudinary uploads are resized by Cloudinary (lib/image.mjs).
  images: {
    qualities: [75],
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
