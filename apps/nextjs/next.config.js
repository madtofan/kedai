/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: ["@acme/api", "@acme/locale"],
  distDir: process.env.NEXT_BUILD_DIR ?? ".next",
};

export default withNextIntl(config);
