"use client";

import type { Prediction } from "@/lib/types";
import { signedPct, pct } from "@/lib/format";

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-lg font-semibold" style={{ color: color || "var(--text)" }}>
        {value}
      </div>
    </div>
  );
}

const confColor: Record<string, string> = {
  High: "var(--up)",
  Medium: "var(--warn)",
  Low: "var(--muted)",
};

const regimeColor: Record<string, string> = {
  Bullish: "var(--up)",
  Bearish: "var(--down)",
  Neutral: "var(--warn)",
};

export function ForecastCard({ p }: { p: Prediction }) {
  const up = p.predicted_return >= 0;
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">AI Forecast</h3>
        <span className="text-xs text-[var(--muted)]">{p.horizon}-day horizon · ensemble</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3">
        <Stat
          label="Expected Return"
          value={signedPct(p.predicted_return)}
          color={up ? "var(--up)" : "var(--down)"}
        />
        <Stat label="Probability Up" value={pct(p.probability_up, 1)} />
        <Stat label="Volatility" value={pct(p.predicted_volatility)} />
        <Stat
          label="Regime (now)"
          value={p.regime}
          color={regimeColor[p.regime] || "var(--text)"}
        />
        <Stat
          label="Confidence"
          value={p.confidence}
          color={confColor[p.confidence] || "var(--text)"}
        />
        <Stat label="Last Price" value={p.last_price.toString()} />
      </div>

      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[var(--panel-2)]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, p.probability_up * 100))}%`,
            background: up ? "var(--up)" : "var(--down)",
          }}
        />
      </div>
      <div className="mt-1 text-xs text-[var(--muted)]">
        Probability the price is higher in {p.horizon} trading day
        {p.horizon > 1 ? "s" : ""}.
      </div>

      {p.regime_conflict && (
        <div className="mt-4 rounded-lg border border-[var(--warn)]/40 bg-[var(--warn)]/10 p-3 text-xs">
          <strong className="text-[var(--warn)]">Signals conflict.</strong>{" "}
          <span className="text-[var(--muted)]">
            The HMM reads the market as <em>currently</em> {p.regime.toLowerCase()},
            but the blended forecast (which weights HMM at just{" "}
            {Math.round((p.weights.hmm ?? 0) * 100)}%) points the other way. These
            measure different things — current state vs. forward prediction — so a
            clash means no clear direction. Confidence has been capped to Low.
          </span>
        </div>
      )}

      {p.models_unavailable && p.models_unavailable.length > 0 && (
        <div className="mt-4 rounded-lg border border-[var(--warn)]/40 bg-[var(--warn)]/10 p-3 text-xs">
          <strong className="text-[var(--warn)]">Partial model set.</strong>{" "}
          <span className="text-[var(--muted)]">
            {p.models_unavailable.join(", ").toUpperCase()} couldn&apos;t run
            (not enough history), so this forecast comes from{" "}
            {Math.round((p.coverage ?? 0) * 100)}% of the normal model weight.
            Treat it with extra caution.
          </span>
        </div>
      )}
    </div>
  );
}
