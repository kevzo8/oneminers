import type { MetadataRoute } from "next";
import { loadDirectory } from "@/lib/directory";
import { getMarket } from "@/lib/market";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dir, market] = await Promise.all([loadDirectory(), getMarket()]);
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/miners`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/vendors`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/sell`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/coins`, lastModified: now, changeFrequency: "hourly", priority: 0.7 },
    { url: `${BASE}/tools/hashrate-converter`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/rankings`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/hosting`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/data`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE}/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/widgets`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/report`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/vendor-terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/ordering`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/legal-notice`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...market.coins.map((coin) => ({
      url: `${BASE}/coins/${coin.id.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.6,
    })),
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
