/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
// const nextConfig = {
//   webpack: (config) => {
//     config.resolve.fallback = {
//       ...config.resolve.fallback,
//       "utf-8-validate": false,
//       "bufferutil": false,
//     };
//     return config;
//   },
// };

// module.exports = nextConfig;
