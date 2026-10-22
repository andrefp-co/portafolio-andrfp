import { absolute } from "@/utils/seo";

// Everything public is crawlable; the restricted vault and the API are not.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/vault", "/api/"] }],
    sitemap: absolute("/sitemap.xml"),
    host: absolute("/"),
  };
}
