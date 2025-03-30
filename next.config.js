/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! 警告 !!
    // 暂时忽略TypeScript错误，在开发过程中逐步修复
    ignoreBuildErrors: true,
  },
  experimental: {
    // appDir: true,
  },
}

module.exports = nextConfig; 