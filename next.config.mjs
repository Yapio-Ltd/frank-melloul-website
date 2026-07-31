/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl
  ? new URL(supabaseUrl).hostname
  : undefined;

const nextConfig = {
  reactStrictMode: true,

  // Optimize images — WebP only (AVIF encoding OOMs on 512 MiB Render)
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 2678400,
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: 'https',
            hostname: supabaseHostname,
            pathname: '/storage/v1/object/public/media/**',
          },
        ]
      : [],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    // Helps reduce client bundle size for heavy libs
    optimizePackageImports: ["framer-motion", "@studio-freight/lenis"],
    // Ensure sharp (upload WebP) stays as native Node module on Render
    serverComponentsExternalPackages: ["sharp"],
  },
};

export default nextConfig;

