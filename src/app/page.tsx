import { StockSearch } from "@/components/StockSearch";
import Link from "next/link";

const MODELS = [
  ["Baseline", "Naive + momentum — the bar everything else must beat"],
  ["ARIMA", "Autoregressive forecast of the return series"],
  ["GARCH", "Volatility forecasting (how much it will move)"],
  ["Kalman", "De-noised dynamic price trend"],
  ["HMM", "Market regime: bullish / neutral / bearish"],
  ["XGBoost", "Gradient boosting on engineered features"],
  ["Ensemble", "Weighted blend of the above + confidence"],
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Quantitative stock prediction
      </h1>
      <p className="mt-2 max-w-2xl text-sm sm:text-base text-[var(--muted)]">
        Enter any ticker to pull live data and run a full quant stack — ARIMA,
        GARCH, Kalman, HMM and XGBoost combined into one ensemble, with Monte
        Carlo simulation and honest walk-forward backtests.
      </p>

      <div className="panel mt-8 p-5">
        <StockSearch large />
      </div>

      <div className="mt-6 rounded-xl border border-[var(--warn)]/30 bg-[var(--warn)]/5 p-4 text-sm text-[var(--muted)]">
        <strong className="text-[var(--text)]">Reality check:</strong> daily
        direction is mostly noise. Good models land around 52–60% directional
        accuracy out-of-sample — the backtest tab shows the real number for each
        stock so you can judge, not guess. This is a research tool, not
        investment advice.
      </div>

      <h2 className="mt-12 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
        The model stack
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODELS.map(([name, desc]) => (
          <div key={name} className="panel p-4">
            <div className="font-medium">{name}</div>
            <div className="mt-1 text-sm text-[var(--muted)]">{desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link href="/stocks/AAPL" className="text-sm text-[var(--accent)] hover:underline">
          → Jump to a live example (AAPL)
        </Link>
      </div>
    </div>
  );
}
