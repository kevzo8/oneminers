import type { Metadata } from "next";
import LegalPage from "@/components/directory/LegalPage";

export const metadata: Metadata = {
  title: "How ordering works",
  description: "How purchases work when you use NowMining's seller listings.",
  alternates: { canonical: "/ordering" },
};

export default function OrderingPage() {
  return (
    <LegalPage
      title="How ordering works"
      intro="NowMining helps you find a miner and a seller. We do not take payment or act as the seller of record."
      sections={[
        {
          heading: "The directory is not a shop",
          paragraphs: [
            "When you click a seller offer you leave our comparison and deal with that seller directly. Prices, stock, shipping, warranty, payment methods and return terms are set by the seller, not by us.",
          ],
        },
        {
          heading: "Before you pay",
          bullets: [
            "Confirm the exact model, hashrate, condition, warranty and included accessories.",
            "Check shipping origin, duties, taxes and delivery time.",
            "Check the seller's reputation and contact details independently.",
            "Pay only to payment details the seller has verified directly with you.",
          ],
        },
        {
          heading: "No escrow or buyer protection",
          paragraphs: [
            "We do not hold funds, provide escrow, issue invoices or arbitrate disputes. If a seller asks for payment outside their normal process, treat it as a warning sign.",
          ],
        },
        {
          heading: "Crypto payments",
          paragraphs: [
            "Crypto payments can be irreversible and exchange rates move quickly. Confirm the network, address and amount before sending funds.",
          ],
        },
        {
          heading: "Hosting",
          paragraphs: [
            "Hosting is a separate service contract with the hosting provider. Our hosting comparison shows published rates and estimated profit; the final terms, uptime commitments and payout setup are agreed with the provider.",
          ],
        },
        {
          heading: "Problems with a listing",
          paragraphs: [
            "If a listing on our site looks wrong or suspicious, use the report form so we can review it. Disputes about a purchase must be taken up with the seller or provider directly.",
          ],
        },
      ]}
    />
  );
}
