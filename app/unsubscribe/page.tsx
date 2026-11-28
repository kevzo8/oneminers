import type { Metadata } from "next";
import ConvexAuthClient from "@/components/portal/ConvexAuthClient";
import UnsubscribeForm from "@/components/directory/UnsubscribeForm";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Stop MinerPicks enquiry emails.",
  robots: { index: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <ConvexAuthClient>
      <UnsubscribeForm initialEmail={typeof email === "string" ? email : ""} />
    </ConvexAuthClient>
  );
}
