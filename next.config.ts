import type { NextConfig } from "next";
import { buildTemplatePreviewRewrites } from "./config/templates";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
        source: "/услуги/google-business",
        destination: "/services/google-business",
      },
      {
        source: "/услуги/социални-мрежи",
        destination: "/services/social-media",
      },
      ...buildTemplatePreviewRewrites(),
    ];
  },
};

export default nextConfig;
