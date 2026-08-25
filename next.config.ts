import type { NextConfig } from "next";
import { buildTemplatePreviewRewrites } from "./config/templates";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.4'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
        source: "/google",
        destination: "/services/google-business",
        permanent: true,
      },
      {
        source: "/gnewsletter",
        destination: "/google/newsletter",
        permanent: true,
      },
      {
        source: "/demo/:category/:id",
        destination: "/templates/:category/:id",
        permanent: true,
      },
      {
        source: "/services/social-media/funnel",
        destination: "/services/social-media/dont-lose-turnover",
        permanent: true,
      },
      {
        source: "/services/online-store/mashina-za-prodazhbi",
        destination: "/services/online-store/mashina-za-prodazhbi-iskam-da-prodavam",
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
