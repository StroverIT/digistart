/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const templateClothing1 =
      process.env.TEMPLATE_CLOTHING_1_URL ?? "http://localhost:3001";

    const rewrites = [
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
    ];

    if (process.env.ENABLE_TEMPLATE_PREVIEW_REWRITES !== "false") {
      rewrites.push(
        {
          source: "/preview/clothing/1",
          destination: `${templateClothing1}/`,
        },
        {
          source: "/preview/clothing/1/:path*",
          destination: `${templateClothing1}/:path*`,
        },
      );
    }

    return rewrites;
  },
};

export default nextConfig;
