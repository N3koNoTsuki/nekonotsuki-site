/** @type {import('next').NextConfig} */

// Local editor: the /edit pages and the write API live in *.dev.tsx / *.dev.ts
// and are only treated as routes by `next dev`. The production build drops those
// extensions, so /edit and /api never ship to the deployed site.
//
// Production runs as a normal Next app (serverless on Vercel) — not a static
// export — so ISR can refresh the GitHub / MyAnimeList data hourly. Pages that
// pull external data opt in via `export const revalidate`; everything else stays
// plain static (generated once at build).
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  images: { unoptimized: true }, // the site uses plain <img>, no next/image optimisation
  pageExtensions: isDev
    ? ["dev.tsx", "dev.ts", "tsx", "ts", "jsx", "js"]
    : ["tsx", "ts", "jsx", "js"],
  // ISR pages re-read the flat-file content at runtime, so bundle those JSON
  // files into the serverless functions that read them.
  experimental: {
    outputFileTracingIncludes: {
      "/projects": ["./content/**"],
      "/competences": ["./content/**"],
      "/collection": ["./content/**"],
      "/music-tracks/[playlistId]": ["./content/**"],
    },
  },
};

export default nextConfig;
