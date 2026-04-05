import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dongluoji.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/cases", "/ranking", "/whitepaper"],
      disallow: ["/api/", "/ops", "/customers", "/tasks", "/history", "/dashboard", "/deployment"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
