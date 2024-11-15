await import("./env.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@kedai/api"],
  distDir: process.env.NEXT_BUILD_DIR ?? ".next",
};

export default nextConfig;
