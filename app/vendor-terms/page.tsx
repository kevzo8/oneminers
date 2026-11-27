import type { Metadata } from "next";
import LegalPage from "@/components/directory/LegalPage";

export const metadata: Metadata = {
  title: "Vendor terms",
  description: "Terms for businesses listing miners and hosting on MinerPicks.",
  alternates: { canonical: "/vendor-terms" },
};

export default function VendorTermsPage() {
  return (
    <LegalPage
      title="Vendor terms"
      intro="These terms govern the relationship between MinerPicks and businesses that list miners or hosting through the seller portal."
      sections={[
        {
          heading: "Who can list",
          paragraphs: [
            "Listings are available to registered businesses that sell mining hardware or provide hosting in the course of their business. Private individuals cannot open a seller account.",
          ],
        },
        {
          heading: "Our role",
          paragraphs: [
            "MinerPicks operates a directory and technical interface. We do not sell the hardware, handle payments, issue invoices, deliver goods or provide hosting. The sale or hosting contract is made directly between you and the buyer. We cannot bind either party or guarantee payment, performance or delivery.",
          ],
        },
        {
          heading: "Your listings",
          bullets: [
            "Prices, stock, condition, warranty, shipping origin, lead times and availability must be accurate and kept current.",
            "You are responsible for product compliance, consumer law, taxes, invoicing, shipping, returns and after-sales support.",
            "Do not list counterfeit, stolen, unsafe or non-compliant goods, or use misleading prices or images.",
            "A Verified badge means we checked documents at a point in time; it is not a guarantee of solvency or performance.",
          ],
        },
        {
          heading: "Plan and fees",
          paragraphs: [
            "During the launch promotion, listings are free for six months. After that we will contact you about continuing the listing. No payment details are collected and nothing is charged automatically. There is no commission on sales. You can cancel at any time; listings then go offline. Terms may change with notice.",
          ],
        },
        {
          heading: "Partner link",
          paragraphs: [
            "Sellers must add a link to OneMiners, our hosting partner, on their website (for example on a partners page) and keep it live. We re-check links weekly. If the link is missing after the grace period, listings are hidden until it is restored.",
          ],
        },
        {
          heading: "Suspension and removal",
          paragraphs: [
            "We may remove a listing or suspend an account for misleading information, prohibited products, abuse or legal requirements. We will give a reason where appropriate.",
          ],
        },
        {
          heading: "Liability",
          paragraphs: [
            "You are liable for your offers and your transactions. To the extent permitted by law, MinerPicks's liability is limited to direct loss and capped at $1,000.",
          ],
        },
        {
          heading: "Changes and contact",
          paragraphs: [
            "We may update these terms with notice. Questions or complaints can be sent through the report form.",
          ],
        },
      ]}
    />
  );
}
