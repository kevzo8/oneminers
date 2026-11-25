import type { MetadataRoute } from "next";
import { MINERS, VENDORS } from "@/lib/catalog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneminers.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/miners`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/vendors`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/sell`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...MINERS.map((miner) => ({
      url: `${BASE}/miners/${miner.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...VENDORS.map((vendor) => ({
      url: `${BASE}/vendors/${vendor.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.5,
    })),
  ];
}
