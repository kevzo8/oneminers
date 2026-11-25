import type { MetadataRoute } from "next";
import { loadDirectory } from "@/lib/directory";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneminers.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dir = await loadDirectory();
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/miners`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/vendors`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/sell`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...dir.miners.map((miner) => ({
      url: `${BASE}/miners/${miner.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...dir.vendors.map((vendor) => ({
      url: `${BASE}/vendors/${vendor.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.5,
    })),
  ];
}
