"use client";

import type { BacktestResponse } from "@/lib/types";
import { pct, num } from "@/lib/format";

export function BacktestTable({ bt }: { bt: BacktestResponse }) {
  const rows = Object.values(bt.results);
  const anyUnreliable = rows.some((r) => !r.error && r.reliable === false);

  return (
    <div className="panel p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Walk-Forward Backtest</h3>
        <span className="text-[11px] sm:text-xs text-[var(--muted)]">
          out-of-sample · {bt.horizon}-day horizon
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Expanding window: train on the past, predict the next day, step forward,
        repeat. Training labels are purged by the horizon so no future data leaks
        in. Directional accuracy near 50% means no edge.
      </p>

      {anyUnreliable && (
        <div className="mt-3 rounded-lg border border-[var(--warn)]/40 bg-[var(--warn)]/10 p-3 text-xs">
          <strong className="text-[var(--warn)]">Sample too small to trust.</strong>{" "}
          <span className="text-[var(--muted)]">
            At this horizon the test windows overlap heavily, leaving too few
            independent samples (see EFF. N). Treat these numbers as noise, not
            evidence — shorten the horizon for a statistically meaningful result.
          </span>
        </div>
      )}

      <div className="scroll-thin mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-[var(--muted)]">
              <th className="py-2 pr-4">Model</th>
              <th className="py-2 pr-4">Dir. Accuracy</th>
              <th className="py-2 pr-4">Sharpe</th>
              <th className="py-2 pr-4">Max Drawdown</th>
              <th className="py-2 pr-4">Win Rate</th>
              <th className="py-2 pr-4">RMSE</th>
              <th className="py-2 pr-4">N</th>
              <th className="py-2 pr-4">Eff. N</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.model} className="border-t border-[var(--border)]">
                <td className="py-2.5 pr-4 font-medium uppercase">{r.model}</td>
                {r.error ? (
                  <td className="py-2.5 text-[var(--warn)]" colSpan={7}>
                    {r.error}
                  </td>
                ) : (
                  <>
                    <td
                      className="py-2.5 pr-4 font-semibold"
                      style={{
                        color:
                          (r.directional_accuracy ?? 0) > 0.52
                            ? "var(--up)"
                            : "var(--text)",
                      }}
                    >
                      {pct(r.directional_accuracy, 1)}
                    </td>
                    <td className="py-2.5 pr-4">{num(r.sharpe)}</td>
                    <td className="py-2.5 pr-4" style={{ color: "var(--down)" }}>
                      {pct(r.max_drawdown, 1)}
                    </td>
                    <td className="py-2.5 pr-4">{pct(r.win_rate, 1)}</td>
                    <td className="py-2.5 pr-4">{pct(r.rmse, 2)}</td>
                    <td className="py-2.5 pr-4 text-[var(--muted)]">{r.n_predictions}</td>
                    <td
                      className="py-2.5 pr-4 font-medium"
                      style={{
                        color: r.reliable === false ? "var(--warn)" : "var(--muted)",
                      }}
                      title={
                        r.reliable === false
                          ? "Too few independent samples — treat as noise"
                          : undefined
                      }
                    >
                      {r.effective_n ?? "—"}
                      {r.reliable === false ? " ⚠" : ""}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
