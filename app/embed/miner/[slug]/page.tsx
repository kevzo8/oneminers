import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EmbedCard from "@/components/directory/EmbedCard";
import { bestPrice, getMiner, loadDirectory, revenuesFor } from "@/lib/directory";
import { formatHashrate } from "@/lib/economics";
import { getMarket } from "@/lib/market";
import { SITE_URL } from "@/lib/site";

export const revalidate = 600;
export const metadata: Metadata = { robots: { index: false } };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SITE = SITE_URL;

export default async function EmbedMinerPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [dir, market] = await Promise.all([loadDirectory(), getMarket()]);
  const miner = getMiner(dir, slug);
  if (!miner) notFound();

  const top = revenuesFor(miner, market)[0];
  const electricity = Math.min(1, Math.max(0, Number(query.e) || 0.07));
  const theme = query.theme === "light" ? "light" : "dark";

  return (
    <EmbedCard
      theme={theme}
      electricity={electricity}
      siteUrl={SITE}
      miner={{
        slug: miner.slug,
        name: `${miner.manufacturer} ${miner.model}`,
        hashrate: formatHashrate(miner.hashrate, miner.unit),
        powerW: miner.powerW,
        coin: top?.tag ?? "",
        incomeUsd: top?.usdPerDay ?? 0,
        bestPrice: bestPrice(dir, miner.slug),
      }}
    />
  );
}
