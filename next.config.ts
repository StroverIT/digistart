import type { NextConfig } from "next";
import { buildTemplatePreviewRewrites } from "./config/templates";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.4'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      {
        pathname: "/**",
        search: "",
      },
      {
        pathname: "/api/uploads/brand/view",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/demo/:category/:id",
        destination: "/templates/:category/:id",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/услуги/онлайн-магазин",
        destination: "/services/online-store",
      },
      {
        source: "/услуги/ai-automation",
        destination: "/services/ai-automation",
      },
      {
        source: "/услуги/google-business",
        destination: "/services/google-business",
      },
      {
        source: "/услуги/социални-мрежи",
        destination: "/services/social-media",
      },
      {
        source: "/услуги/реклами",
        destination: "/services/ads",
      },
      ...buildTemplatePreviewRewrites(),
    ];
  },
};

export default nextConfig;
