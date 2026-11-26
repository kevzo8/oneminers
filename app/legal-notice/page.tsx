import type { Metadata } from "next";
import LegalPage from "@/components/directory/LegalPage";
import { HOSTING_PROVIDER } from "@/lib/hosting";

export const metadata: Metadata = {
  title: "Legal notice",
  description: "Publisher information, data licences, trademarks and partner disclosure for NowMining.",
  alternates: { canonical: "/legal-notice" },
};

export default function LegalNoticePage() {
  return (
    <LegalPage
      title="Legal notice"
      intro="Publisher information, content licences and disclosures for NowMining."
      sections={[
        {
          heading: "Publisher",
          paragraphs: [
            "This site is published as NowMining, an independent ASIC mining directory and analysis tool. For questions, corrections or legal notices, use the report form. Registered publisher details will be added before commercial launch.",
          ],
        },
        {
          heading: "Copyright",
          paragraphs: [
            "© 2026 NowMining. All rights reserved. Site design, copy and generated tooling belong to NowMining. Third-party logos, product images and trademarks remain the property of their owners and are used here for identification only.",
          ],
        },
        {
          heading: "Data sources and licences",
          bullets: [
            "Network data, miner catalogue and market price ranges: BackPoW (CC BY 4.0).",
            "Selected physical specifications: D-Central Technologies (CC BY 4.0).",
            "Coin prices, market caps and charts: CoinGecko. Bitcoin network data: mempool.space.",
            "Miner specifications are also checked against manufacturer datasheets. Coin icons use CC0 icon sets or project logos; manufacturer marks are either official favicons from the brand's own site or generated monograms.",
          ],
        },
        {
          heading: "Partner disclosure",
          paragraphs: [
            `${HOSTING_PROVIDER} is a hosting partner and advertiser on this site. Partner sellers are required to link to ${HOSTING_PROVIDER} as part of the launch promotion. Hosting rates are published by the provider, and hosting comparisons are estimates rather than quotes.`,
          ],
        },
        {
          heading: "No affiliation",
          paragraphs: [
            "NowMining is not affiliated with ASIC Miner Value, WhatToMine, Hashrate.no or the manufacturers whose hardware appears here. References to those sites are for comparison only and no data is taken from them.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "Send legal notices, correction requests or data deletion requests through the report form. We aim to respond within a reasonable time.",
          ],
        },
      ]}
    />
  );
}
