"use client";

import { use, useState } from "react";
import { StockSearch } from "@/components/StockSearch";
import { PriceChart } from "@/components/charts/PriceChart";
import { MonteCarloChart } from "@/components/charts/MonteCarloChart";
import { ForecastCard } from "@/components/prediction/ForecastCard";
import { ModelBreakdown } from "@/components/prediction/ModelBreakdown";
import { BacktestTable } from "@/components/BacktestTable";
import {
  useBacktest,
  useMonteCarlo,
  usePrediction,
  useStock,
} from "@/hooks/useStockData";
import { signedPct, num } from "@/lib/format";

function Skeleton({ h = 200 }: { h?: number }) {
  return (
    <div
      className="panel animate-pulse bg-[var(--panel-2)]"
      style={{ height: h }}
    />
  );
}

function ErrorPanel({ msg }: { msg: string }) {
  return (
    <div className="panel p-5 text-sm">
      <span className="text-[var(--down)]">Couldn&apos;t load this.</span>{" "}
      <span className="text-[var(--muted)]">{msg}</span>
    </div>
  );
}

export default function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: raw } = use(params);
  const symbol = decodeURIComponent(raw).toUpperCase();

  const [horizon, setHorizon] = useState(1);

  const stock = useStock(symbol);
  const prediction = usePrediction(symbol, horizon);
  const monteCarlo = useMonteCarlo(symbol, 21);
  const backtest = useBacktest(symbol, undefined, horizon);

  const kalmanTrend = prediction.data?.components?.kalman?.trend;
  const currency = stock.data?.info.currency ?? "";

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <StockSearch />
      </div>

      {/* Header */}
      {stock.isLoading ? (
        <Skeleton h={90} />
      ) : stock.isError ? (
        <ErrorPanel msg={(stock.error as Error).message} />
      ) : stock.data ? (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-[var(--muted)]">
              {stock.data.info.exchange || "—"}
              {stock.data.info.sector ? ` · ${stock.data.info.sector}` : ""}
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {stock.data.info.company_name || symbol}{" "}
              <span className="text-[var(--muted)]">({symbol})</span>
            </h1>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold">
              {num(stock.data.last_price)}{" "}
              <span className="text-sm text-[var(--muted)]">{currency}</span>
            </div>
            <div
              className="text-sm font-medium"
              style={{
                color: stock.data.change_pct >= 0 ? "var(--up)" : "var(--down)",
              }}
            >
              {signedPct(stock.data.change_pct / 100)}
            </div>
          </div>
        </div>
      ) : null}

      {/* Stat strip */}
      {stock.data && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(stock.data.stats).map(([k, v]) => (
            <div key={k} className="panel p-3">
              <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                {k.replaceAll("_", " ")}
              </div>
              <div className="mt-1 font-semibold">{num(v)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Price chart */}
      <div className="panel mt-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Price</h3>
          <span className="text-xs text-[var(--muted)]">
            candles · blue line = Kalman de-noised trend
          </span>
        </div>
        {stock.isLoading ? (
          <Skeleton h={380} />
        ) : stock.data ? (
          <PriceChart candles={stock.data.candles} trend={kalmanTrend} />
        ) : null}
      </div>

      {/* Horizon selector */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Forecast horizon</span>
        <div className="inline-flex overflow-hidden rounded-lg border border-[var(--border)]">
          {[
            { d: 1, label: "1D" },
            { d: 3, label: "3D" },
            { d: 5, label: "1W" },
            { d: 10, label: "2W" },
            { d: 21, label: "1M" },
          ].map(({ d, label }) => (
            <button
              key={d}
              onClick={() => setHorizon(d)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                horizon === d
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--panel-2)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--muted)]">
          trading days ahead — longer horizons carry more uncertainty
        </span>
      </div>

      {/* Forecast + model breakdown */}
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {prediction.isLoading ? (
          <Skeleton h={240} />
        ) : prediction.isError ? (
          <ErrorPanel msg={(prediction.error as Error).message} />
        ) : prediction.data ? (
          <ForecastCard p={prediction.data} />
        ) : null}

        {prediction.data ? (
          <ModelBreakdown p={prediction.data} />
        ) : prediction.isLoading ? (
          <Skeleton h={240} />
        ) : null}
      </div>

      {/* Monte Carlo */}
      <div className="mt-6">
        {monteCarlo.isLoading ? (
          <Skeleton h={360} />
        ) : monteCarlo.isError ? (
          <ErrorPanel msg={(monteCarlo.error as Error).message} />
        ) : monteCarlo.data ? (
          <MonteCarloChart mc={monteCarlo.data} />
        ) : null}
      </div>

      {/* Backtest */}
      <div className="mt-6">
        {backtest.isLoading ? (
          <div className="panel p-5 text-sm text-[var(--muted)]">
            Running walk-forward backtest… (this retrains models across history,
            give it a few seconds)
          </div>
        ) : backtest.isError ? (
          <ErrorPanel msg={(backtest.error as Error).message} />
        ) : backtest.data ? (
          <BacktestTable bt={backtest.data} />
        ) : null}
      </div>

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        Data via Yahoo Finance. Research & education only — not investment advice.
      </p>
    </div>
  );
}
