import type { Metadata } from "next";
import LegalPage from "@/components/directory/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What MinerPicks stores, why, and how to request deletion.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="This page explains what information MinerPicks stores when you use the directory, contact form or seller portal."
      sections={[
        {
          heading: "Information you provide",
          bullets: [
            "Newsletter signups: your email address, stored so we can send updates. Unsubscribe instructions are included in each email once email delivery is enabled.",
            "Contact, report and bulk-quote forms: your name, email, message and the details you choose to send. These are stored as leads in our database so we can reply.",
            "Seller accounts: username and password, handled by Convex Auth, plus your company profile, listings and verification documents you provide.",
          ],
        },
        {
          heading: "Information stored on your device",
          paragraphs: [
            "Your electricity price, currency, pool fee and watchlist are kept in your browser's local storage so settings persist between visits. A Convex Auth session token is kept in local storage when you sign in to the seller portal. We do not use advertising or third-party analytics cookies at this time.",
          ],
        },
        {
          heading: "How we use information",
          bullets: [
            "To run the directory, seller portal and verification checks.",
            "To respond to messages and leads you submit.",
            "To prevent fraud, abuse and unauthorized seller listings.",
            "To meet legal and tax obligations where applicable.",
          ],
        },
        {
          heading: "Sharing",
          paragraphs: [
            "We do not sell or rent personal information. Data is shared only with service providers needed to operate the site (hosting, database, email delivery if enabled), with sellers when you explicitly contact them, or when required by law.",
          ],
        },
        {
          heading: "Retention and deletion",
          paragraphs: [
            "Leads and account data are kept while needed to respond, operate the service or satisfy legal obligations. You can request access, correction or deletion of your personal data through the report form. We may need to verify your identity before acting.",
          ],
        },
        {
          heading: "Children",
          paragraphs: [
            "The site is not directed at children under 13 and we do not knowingly collect their data.",
          ],
        },
        {
          heading: "Changes",
          paragraphs: [
            "We may update this policy. The current version and its last-updated date are always shown here.",
          ],
        },
      ]}
    />
  );
}
