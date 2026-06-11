import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SITE_URL } from "@/lib/site";

const DESCRIPTION = "Portfolio de NekoNoTsuki : projets, anime, musique, jeux et parcours.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NekoNoTsuki Portfolio",
    template: "%s — NekoNoTsuki",
  },
  description: DESCRIPTION,
  icons: {
    icon: "/favicon.svg",
  },
  // Rich previews when the site is shared (Discord, Twitter, LinkedIn…).
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "NekoNoTsuki",
    title: "NekoNoTsuki Portfolio",
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "NekoNoTsuki — portfolio kawaii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NekoNoTsuki Portfolio",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#fcd9e5",
  width: "device-width",
  initialScale: 1,
};

// Runs before paint to avoid a flash of the wrong theme. Progressive
// enhancement only — public pages render fully without JS (default = light).
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (stored === null && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
