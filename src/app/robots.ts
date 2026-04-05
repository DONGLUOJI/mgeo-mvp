import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/detect", "/pricing", "/cases", "/ranking"],
      disallow: ["/api/", "/ops", "/customers", "/tasks", "/history", "/dashboard", "/deployment"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
