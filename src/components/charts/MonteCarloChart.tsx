"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonteCarlo } from "@/lib/types";
import { num, pct, signedPct } from "@/lib/format";

export function MonteCarloChart({ mc }: { mc: MonteCarlo }) {
  // Reshape sample paths (array of [day0..dayN]) into rows per day for recharts.
  const maxPaths = Math.min(mc.sample_paths.length, 30);
  const days = mc.days + 1;
  const data = Array.from({ length: days }, (_, d) => {
    const row: Record<string, number> = { day: d };
    for (let i = 0; i < maxPaths; i++) row[`p${i}`] = mc.sample_paths[i][d];
    return row;
  });

  return (
    <div className="panel p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-sm sm:text-base">
          Monte Carlo — {mc.days} trading days
        </h3>
        <span className="text-[11px] sm:text-xs text-[var(--muted)]">
          {mc.n_paths.toLocaleString()} paths
        </span>
      </div>

      <div className="mt-4 h-[220px] sm:h-[260px] w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
            <XAxis dataKey="day" stroke="#8b97ab" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#8b97ab"
              fontSize={11}
              tickLine={false}
              domain={["auto", "auto"]}
              width={52}
            />
            <Tooltip
              contentStyle={{
                background: "#1a2130",
                border: "1px solid #232c3d",
                borderRadius: 10,
                fontSize: 12,
              }}
              labelFormatter={(d) => `Day ${d}`}
              formatter={(v) => [num(typeof v === "number" ? v : Number(v)), "path"]}
            />
            {Array.from({ length: maxPaths }, (_, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`p${i}`}
                stroke="#4f8cff"
                strokeOpacity={0.18}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Tile label="P5 (downside)" value={num(mc.p05)} color="var(--down)" />
        <Tile label="Median" value={num(mc.median)} />
        <Tile label="P95 (upside)" value={num(mc.p95)} color="var(--up)" />
        <Tile
          label={`P(up) in ${mc.days}d`}
          value={pct(mc.probability_up, 1)}
        />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <Tile
          label="1% worst case (crash)"
          value={num(mc.p01)}
          color="var(--down)"
        />
        <Tile label="1% best case" value={num(mc.p99)} color="var(--up)" />
      </div>
      <div className="mt-3 space-y-1 text-xs text-[var(--muted)]">
        <p>
          Expected {mc.days}-day move {signedPct(mc.expected_return)} · vol{" "}
          {pct(mc.sigma_daily_start)}→{pct(mc.sigma_daily_end)}/day (GARCH term
          structure) · {(mc.innovation ?? "student_t").replace("_", "-")} shocks (fat tails).
        </p>
        <p>
          Drift shrunk to {signedPct(mc.drift_annual, 1)}/yr from a raw{" "}
          {signedPct(mc.drift_raw_annual, 1)}/yr (t={(mc.drift_t_stat ?? 0).toFixed(2)},{" "}
          {pct(mc.drift_shrinkage_weight ?? 0, 0)} weight on the sample mean) — the
          trailing return is too noisy to trust, so it&apos;s pulled toward the
          risk-free rate.
        </p>
        <p>A distribution of outcomes, not a prediction of one.</p>
      </div>
    </div>
  );
}

function Tile({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-[var(--panel-2)] p-3">
      <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div className="mt-1 font-semibold" style={{ color: color || "var(--text)" }}>
        {value}
      </div>
    </div>
  );
}
