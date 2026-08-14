import type { MetadataRoute } from "next";
import { getAllLocationSlugs } from "@/lib/locations";
import { getAllRouteSlugs } from "@/lib/routes";
import { SERVICES } from "@/lib/services";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes = ["", "/book", "/fares", "/cancellation"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const serviceRoutes = SERVICES.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const locationRoutes = getAllLocationSlugs().map((slug) => ({
    url: `${baseUrl}/locations/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const routeRoutes = getAllRouteSlugs().map((slug) => ({
    url: `${baseUrl}/routes/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...locationRoutes, ...routeRoutes, ...serviceRoutes];
}
