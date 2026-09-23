"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { num, pct, signedPct } from "@/lib/format";
import type { V2Validation } from "@/lib/types";

const MARKETS = [
  { id: "us", label: "US (327 stocks)" },
  { id: "india", label: "India NSE (82)" },
];

function Metric({
  label, value, hint, color,
}: { label: string; value: string; hint: string; color?: string }) {
  return (
    <div className="rounded-lg bg-[var(--panel-2)] p-3">
      <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-lg font-semibold" style={{ color: color || "var(--text)" }}>
        {value}
      </div>
      <div className="mt-1 text-[11px] leading-snug text-[var(--muted)]">{hint}</div>
    </div>
  );
}

function YearBars({ yearly }: { yearly: Record<string, number> }) {
  const entries = Object.entries(yearly);
  const max = Math.max(...entries.map(([, v]) => Math.abs(v)), 1);
  return (
    <div className="mt-4">
      <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
        Net return by year (after costs)
      </div>
      <div className="scroll-thin mt-2 flex items-end gap-1 overflow-x-auto pb-1">
        {entries.map(([year, v]) => (
          <div key={year} className="flex min-w-[42px] flex-col items-center gap-1">
            <div className="flex h-[70px] w-full items-end justify-center">
              <div
                title={`${year}: ${v > 0 ? "+" : ""}${v}%`}
                style={{
                  height: `${Math.max(3, (Math.abs(v) / max) * 68)}px`,
                  background: v >= 0 ? "var(--up)" : "var(--down)",
                }}
                className="w-5 rounded-sm"
              />
            </div>
            <span className="text-[10px] text-[var(--muted)]">{year.slice(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Validation({ market, horizon }: { market: string; horizon: number }) {
  const v = useQuery({
    queryKey: ["v2val", market, horizon],
    queryFn: () => api.validationV2(market, horizon, 10),
  });

  if (v.isLoading)
    return (
      <div className="panel p-5 text-sm text-[var(--muted)]">
        Running 20-year walk-forward with transaction costs… (first run takes
        several minutes)
      </div>
    );
  if (v.isError || !v.data || v.data.error)
    return (
      <div className="panel p-5 text-sm text-[var(--muted)]">
        Validation unavailable: {v.data?.error ?? (v.error as Error)?.message}
      </div>
    );

  const d: V2Validation = v.data;
  const real = d.significant_after_costs;

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Does this survive reality?</h3>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: real
              ? "color-mix(in srgb, var(--up) 18%, transparent)"
              : "color-mix(in srgb, var(--warn) 18%, transparent)",
            color: real ? "var(--up)" : "var(--warn)",
          }}
        >
          {real ? "Significant after costs" : "Positive but not proven"}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {d.universe_size} stocks · {d.history_start} → {d.history_end} ·{" "}
        {d.n_test_days.toLocaleString()} out-of-sample days · long-short quintile
        portfolio rebalanced every {d.rebalance_every}d at{" "}
        {d.cost_bps_round_trip}bps round trip.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          label="Net return / yr"
          value={`${d.annualised_net_pct >= 0 ? "+" : ""}${d.annualised_net_pct.toFixed(2)}%`}
          hint={`Gross ${d.annualised_gross_pct.toFixed(2)}% before costs.`}
          color={d.annualised_net_pct > 0 ? "var(--up)" : "var(--down)"}
        />
        <Metric
          label="Net Sharpe"
          value={d.net_sharpe.toFixed(2)}
          hint="Return per unit of risk. ~0.5 is modest but real."
        />
        <Metric
          label="Net t-stat"
          value={d.net_t_stat.toFixed(2)}
          hint="Non-overlapping periods, so this test is valid. >2 = unlikely luck."
          color={d.net_t_stat > 2 ? "var(--up)" : "var(--warn)"}
        />
        <Metric
          label="Max drawdown"
          value={pct(d.max_drawdown, 1)}
          hint={`Profitable in ${d.profitable_years} years.`}
          color="var(--down)"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric
          label="Rank IC"
          value={d.rank_ic.toFixed(4)}
          hint="Predicted vs actual ranking correlation."
        />
        <Metric
          label="IC t-stat (NW)"
          value={d.ic_t_stat.toFixed(2)}
          hint={`Newey-West corrected for overlap. Uncorrected it would read ${d.ic_t_stat_naive.toFixed(2)} — inflated.`}
          color={Math.abs(d.ic_t_stat) > 2 ? "var(--up)" : "var(--warn)"}
        />
        <Metric
          label="IC > 0 days"
          value={pct(d.ic_positive_days_pct, 1)}
          hint="How often the ranking pointed the right way."
        />
      </div>

      <YearBars yearly={d.yearly_net_pct} />

      <div className="mt-4 rounded-lg border border-[var(--warn)]/40 bg-[var(--warn)]/10 p-3 text-xs text-[var(--muted)]">
        <strong className="text-[var(--warn)]">Remaining known bias.</strong> The
        universe is today&apos;s surviving large caps, so companies that went
        bankrupt or were delisted are missing — this inflates results by an amount
        not measured here. Returns also assume you can short the bottom quintile.
        Treat the net figure as an optimistic upper bound.
      </div>
    </div>
  );
}

export default function RankingsPage() {
  const [market, setMarket] = useState("us");
  const horizon = 21;

  const r = useQuery({
    queryKey: ["v2rank", market, horizon],
    queryFn: () => api.rankingsV2(market, horizon),
  });

  const rows = r.data?.rankings ?? [];
  const top = rows.slice(0, 10);
  const bottom = rows.slice(-10).reverse();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Cross-Sectional Rankings</h1>
      <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
        Trained across the whole universe over 20 years to rank stocks by
        risk-adjusted return <em>relative to the market</em>. This is the only part
        of the platform with a measurable, cost-surviving edge — and it is a modest
        one. Single-stock direction prediction remains a coin flip.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="inline-flex overflow-hidden rounded-lg border border-[var(--border)]">
          {MARKETS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMarket(m.id)}
              className={`px-4 py-1.5 text-sm ${
                market === m.id
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--panel-2)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--muted)]">
          21-day horizon
          {r.data ? ` · as of ${r.data.as_of} · trained through ${r.data.trained_through}` : ""}
        </span>
      </div>

      <div className="mt-6">
        <Validation market={market} horizon={horizon} />
      </div>

      {r.isLoading ? (
        <div className="panel mt-6 p-5 text-sm text-[var(--muted)]">
          Training on 20 years of data…
        </div>
      ) : r.isError ? (
        <div className="panel mt-6 p-5 text-sm">
          <span className="text-[var(--down)]">Couldn&apos;t load rankings.</span>{" "}
          <span className="text-[var(--muted)]">{(r.error as Error).message}</span>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <RankTable title="Top ranked" subtitle="highest risk-adjusted score" rows={top} positive />
          <RankTable title="Bottom ranked" subtitle="lowest risk-adjusted score" rows={bottom} />
        </div>
      )}

      {r.data?.top_features?.length ? (
        <div className="panel mt-6 p-5">
          <h3 className="font-semibold">What the model leans on</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.data.top_features.map((f) => (
              <span
                key={f.feature}
                className="rounded-full border border-[var(--border)] bg-[var(--panel-2)] px-3 py-1 text-xs text-[var(--muted)]"
              >
                {f.feature}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        Scores are relative rankings, not buy signals or return forecasts.
        Research &amp; education only — not investment advice.
      </p>
    </div>
  );
}

function RankTable({
  title, subtitle, rows, positive,
}: {
  title: string;
  subtitle: string;
  rows: { rank: number; symbol: string; price: number; score?: number; percentile: number }[];
  positive?: boolean;
}) {
  return (
    <div className="panel p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-[var(--muted)]">
            <th className="py-2 pr-2">#</th>
            <th className="py-2 pr-2">Symbol</th>
            <th className="py-2 pr-2">Price</th>
            <th className="py-2 pr-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol} className="border-t border-[var(--border)]">
              <td className="py-2 pr-2 text-[var(--muted)]">{row.rank}</td>
              <td className="py-2 pr-2 font-medium">
                <Link
                  href={`/stocks/${encodeURIComponent(row.symbol)}`}
                  className="hover:text-[var(--accent)] hover:underline"
                >
                  {row.symbol}
                </Link>
              </td>
              <td className="py-2 pr-2">{num(row.price)}</td>
              <td
                className="py-2 pr-2 text-right font-semibold"
                style={{ color: positive ? "var(--up)" : "var(--down)" }}
              >
                {row.score?.toFixed(3) ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
