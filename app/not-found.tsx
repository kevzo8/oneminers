import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { PageShell } from "@/components/directory/ui";

export default function NotFound() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <div className="surface-strong mt-8 rounded-3xl p-8 text-center sm:p-12">
          <div className="chip text-aqua">404 · Not found</div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">This page isn’t available.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
            The link may be broken, the item may have moved, or it may not be published yet. The directory below is still fully
            searchable — or head back to the homepage and start again.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Link href="/" className="btn-primary px-5 py-2.5 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to homepage
            </Link>
            <Link href="/miners" className="btn-ghost px-5 py-2.5 text-sm">
              <Search className="h-4 w-4" /> Browse miners
            </Link>
            <Link href="/vendors" className="btn-ghost px-5 py-2.5 text-sm">
              Browse vendors
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
