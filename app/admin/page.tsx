import type { Metadata } from "next";
import AdminPanel from "@/components/portal/AdminPanel";
import ConvexAuthClient from "@/components/portal/ConvexAuthClient";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Admin" }]} />
        <ConvexAuthClient>
          <AdminPanel />
        </ConvexAuthClient>
      </div>
    </PageShell>
  );
}
