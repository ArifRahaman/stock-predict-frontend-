"use client";

import type { Prediction } from "@/lib/types";
import { signedPct, pct } from "@/lib/format";

/** Human-readable one-liner for each model's contribution. */
function describe(name: string, c: Prediction["components"][string]): { value: string; color: string } {
  switch (name) {
    case "arima":
      return { value: signedPct(c.predicted_return), color: tone(c.predicted_return) };
    case "kalman":
      return { value: signedPct(c.predicted_return), color: tone(c.predicted_return) };
    case "xgboost":
      return {
        value: `${signedPct(c.predicted_return)}  ·  P(up) ${pct(c.probability_up, 0)}`,
        color: tone(c.predicted_return),
      };
    case "garch":
      return { value: `vol ${pct(c.predicted_volatility)}`, color: "var(--text)" };
    case "hmm":
      return {
        value: c.regime || "—",
        color:
          c.regime === "Bullish" ? "var(--up)" : c.regime === "Bearish" ? "var(--down)" : "var(--warn)",
      };
    default:
      return { value: "—", color: "var(--muted)" };
  }
}

function tone(v?: number) {
  if (v === undefined || v === null) return "var(--muted)";
  return v >= 0 ? "var(--up)" : "var(--down)";
}

const ORDER = ["arima", "garch", "kalman", "hmm", "xgboost"];

export function ModelBreakdown({ p }: { p: Prediction }) {
  return (
    <div className="panel p-5">
      <h3 className="font-semibold">Model Breakdown</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Each model&apos;s independent read. The ensemble weights them{" "}
        {Object.entries(p.weights)
          .map(([k, v]) => `${k} ${Math.round(v * 100)}%`)
          .join(" · ")}
        .
      </p>

      <div className="mt-4 divide-y divide-[var(--border)]">
        {ORDER.filter((m) => p.components[m]).map((m) => {
          const c = p.components[m];
          const d = describe(m, c);
          return (
            <div key={m} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-6 w-16 items-center justify-center rounded-md bg-[var(--panel-2)] text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {m}
                </span>
                {c.note && <span className="text-xs text-[var(--warn)]">{c.note}</span>}
              </div>
              <span className="font-medium" style={{ color: d.color }}>
                {d.value}
              </span>
            </div>
          );
        })}
      </div>

      {p.components.xgboost?.top_features?.length ? (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
            XGBoost top features
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.components.xgboost.top_features.map((f) => (
              <span
                key={f.feature}
                className="rounded-full border border-[var(--border)] bg-[var(--panel-2)] px-2.5 py-1 text-xs text-[var(--muted)]"
              >
                {f.feature}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
