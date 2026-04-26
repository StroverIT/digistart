/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/услуги/websites",
        destination: "/услуги/уебсайт",
        permanent: true,
      },
      {
        source: "/услуги/готов-онлайн-магазин",
        destination: "/услуги/онлайн-магазин",
        permanent: true,
      },
      {
        source: "/услуги/онлайн-магазини",
        destination: "/услуги/онлайн-магазин",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
