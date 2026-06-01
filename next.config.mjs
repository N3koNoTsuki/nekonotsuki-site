/** @type {import('next').NextConfig} */

// The local editor lives in *.dev.tsx / *.dev.ts files (pages under /edit and
// the write API under /api). They're only treated as routes by `next dev`.
// The production build runs with NODE_ENV=production and drops those
// extensions, so `next build` exports a 100% static site with no /edit, no API.
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  // Static export only for the production build. In `next dev` we need a real
  // server so the local /edit dynamic API routes (/api/pages/[slug], etc.)
  // work — `output: export` forbids dynamic routes without generateStaticParams.
  ...(isDev ? {} : { output: "export" }),
  images: { unoptimized: true }, // required for static export
  pageExtensions: isDev
    ? ["dev.tsx", "dev.ts", "tsx", "ts", "jsx", "js"]
    : ["tsx", "ts", "jsx", "js"],
};

export default nextConfig;
