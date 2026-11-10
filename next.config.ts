import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["sequelize", "pg", "tedious"],
};



module.exports = {
  distDir: 'build',
}

export default nextConfig;