import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NekoNoTsuki Portfolio",
    template: "%s — NekoNoTsuki",
  },
  description: "Portfolio de NekoNoTsuki : projets, favoris et parcours.",
  icons: {
    icon: "/favicon.svg",
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
      <body>{children}</body>
    </html>
  );
}
