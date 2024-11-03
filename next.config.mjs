/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["localhost"], // Add your domain here
  },
  reactStrictMode: true,
  headers: async () => {
    return [
      {
        source: "/service-worker.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
