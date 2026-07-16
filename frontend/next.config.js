/** @type {import('next').NextConfig} */
const { execSync } = require("child_process");

const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
  (() => {
    try {
      return execSync("git rev-parse --short HEAD").toString().trim();
    } catch {
      return new Date().toISOString();
    }
  })();

const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
};

module.exports = nextConfig;
