"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, LogIn, Menu, X } from "lucide-react";
import { navLinks } from "@/lib/data";
import { BRAND } from "@/lib/brand";
import HeaderSettings from "@/components/directory/HeaderSettings";

function Brand() {
  return (
    <a href="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-line bg-panel-soft">
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M16 3 28 9.9v12.2L16 29 4 22.1V9.9L16 3Z" stroke="#B9FF66" strokeWidth="1.6" />
          <path d="M11 12h6a4 4 0 1 1 0 8h-2l6 6" stroke="#4DE1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-sm font-bold tracking-[0.18em] text-ink">
        {BRAND.logo[0]}<span className="text-accent">{BRAND.logo[1]}</span>
      </span>
    </a>
  );
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main">
          {navLinks.map((link) =>
            link.href === "/vendor-portal" ? (
              <a
                key={link.href}
                href={link.href}
                className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/20"
              >
                <LogIn className="h-3.5 w-3.5" />
                {link.label}
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-panel-soft hover:text-ink"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <HeaderSettings />
          <a href="/sell" className="btn-primary px-4 py-2 text-[13px]">
            Sell miners
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-panel-soft text-ink xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-bg/95 px-5 pb-6 pt-4 backdrop-blur-xl xl:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {navLinks.map((link) =>
              link.href === "/vendor-portal" ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="mb-3 mt-2 inline-flex w-full items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-4 py-2.5 text-base font-semibold text-accent"
                >
                  <LogIn className="h-4 w-4" />
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-line/60 py-3 text-base font-medium text-ink"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>
          <div className="mt-4">
            <HeaderSettings />
          </div>
          <a href="/sell" onClick={() => setOpen(false)} className="btn-primary mt-5 w-full px-4 py-3 text-sm">
            List your company
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      ) : null}
    </header>
  );
}
