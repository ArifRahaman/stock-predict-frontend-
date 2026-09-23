"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const EXAMPLES = ["AAPL", "MSFT", "NVDA", "TSLA", "RELIANCE.NS", "TCS.NS", "INFY.NS"];

export function StockSearch({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function go(symbol: string) {
    const s = symbol.trim().toUpperCase();
    if (s) router.push(`/stocks/${encodeURIComponent(s)}`);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className="flex gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search any ticker — AAPL, NVDA, RELIANCE.NS …"
          className={`flex-1 px-4 outline-none focus:border-[var(--accent)] ${
            large ? "py-3 text-base" : "py-2 text-sm"
          }`}
        />
        <button type="submit" className={`btn px-5 ${large ? "py-3" : "py-2 text-sm"}`}>
          Analyze
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((s) => (
          <button
            key={s}
            onClick={() => go(s)}
            className="rounded-full border border-[var(--border)] bg-[var(--panel-2)] px-3 py-1 text-xs text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
