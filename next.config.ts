import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The /api/assets route reads public/ via fs, which makes @vercel/nft trace
  // the entire public folder into the serverless function. That route only ever
  // needs to list public/assets and public/img at runtime, and everything else
  // in public/ is served statically by the CDN — so exclude the heavy media
  // folders/files from the trace to keep the function bundle under Vercel's
  // 250MB limit.
  outputFileTracingExcludes: {
    "/api/assets": [
      "public/rwb/**/*",
      "public/wme/**/*",
      "public/video/**/*",
      "public/cortinillas/**/*",
      "public/agua/**/*",
      "public/whome/**/*",
      "public/**/*.mp4",
      "public/**/*.mov",
      "public/**/*.html",
      "public/**/*.pdf",
    ],
    "/*": [
      "public/rwb/**/*",
      "public/wme/**/*",
      "public/video/**/*",
      "public/cortinillas/**/*",
      "public/agua/**/*",
      "public/whome/**/*",
      "public/**/*.mp4",
      "public/**/*.mov",
      "public/**/*.html",
      "public/**/*.pdf",
    ],
  },
};

export default nextConfig;
