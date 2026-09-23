"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard", icon: "▣" },
  { href: "/stocks/AAPL", label: "Stock Analysis", icon: "📈", match: "/stocks" },
  { href: "/rankings", label: "Rankings", icon: "☰", match: "/rankings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[var(--accent)] text-lg">◆</span>
          <span className="font-semibold tracking-tight text-sm">Quant Lab</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-3 py-1.5 text-sm"
        >
          {open ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden fixed inset-x-0 top-[49px] z-20 border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = item.match
                ? pathname.startsWith(item.match)
                : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    active
                      ? "bg-[var(--panel-2)] text-[var(--text)]"
                      : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-2)]"
                  }`}
                >
                  <span className="w-4 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-[230px] shrink-0 border-r border-[var(--border)] bg-[var(--panel)] p-4 hidden md:flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 px-2">
          <span className="text-[var(--accent)] text-xl">◆</span>
          <span className="font-semibold tracking-tight">Quant Lab</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = item.match
              ? pathname.startsWith(item.match)
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[var(--panel-2)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-2)]"
                }`}
              >
                <span className="w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto text-[11px] leading-relaxed text-[var(--muted)] px-2">
          Research & education only. Not investment advice. Model outputs are
          estimates with real uncertainty.
        </div>
      </aside>
    </>
  );
}
