import type { MetadataRoute } from "next";
import { ALL } from "@/lib/nav";
import { SITE_URL } from "@/lib/site";

// Every public page of the site — driven by lib/nav so a new nav entry lands
// in the sitemap automatically.
export default function sitemap(): MetadataRoute.Sitemap {
  return ALL.map((item) => ({
    url: item.href === "/" ? SITE_URL : `${SITE_URL}${item.href}`,
  }));
}
