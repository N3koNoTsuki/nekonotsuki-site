/** @type {import('next').NextConfig} */

// The local editor lives in *.dev.tsx / *.dev.ts files (pages under /edit and
// the write API under /api). They're only treated as routes by `next dev`.
// The production build runs with NODE_ENV=production and drops those
// extensions, so `next build` exports a 100% static site with no /edit, no API.
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  output: "export", // static site → out/ (no server, no DB at runtime)
  images: { unoptimized: true }, // required for static export
  pageExtensions: isDev
    ? ["dev.tsx", "dev.ts", "tsx", "ts", "jsx", "js"]
    : ["tsx", "ts", "jsx", "js"],
};

export default nextConfig;
