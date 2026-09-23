import type {
  BacktestResponse,
  CsValidation,
  MonteCarlo,
  Prediction,
  RankingsResponse,
  StockDetail,
  V2Validation,
} from "./types";

// Empty base = same-origin. Calls hit /api/... and Next.js rewrites them to the
// FastAPI backend server-side (see next.config.ts). Avoids CORS entirely.
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  stock: (symbol: string, period = "2y") =>
    get<StockDetail>(`/api/stocks/${encodeURIComponent(symbol)}?period=${period}`),

  prediction: (symbol: string, horizon = 1) =>
    get<Prediction>(
      `/api/predictions/${encodeURIComponent(symbol)}?horizon=${horizon}`
    ),

  monteCarlo: (symbol: string, days = 21) =>
    get<MonteCarlo>(
      `/api/predictions/${encodeURIComponent(symbol)}/monte-carlo?days=${days}`
    ),

  backtest: (symbol: string, models = "baseline,kalman,xgboost", horizon = 1) =>
    get<BacktestResponse>(
      `/api/backtest/${encodeURIComponent(symbol)}?models=${models}&horizon=${horizon}`
    ),

  rankings: (market = "us", horizon = 21) =>
    get<RankingsResponse>(`/api/rankings/${market}?horizon=${horizon}`),

  csValidation: (market = "us", horizon = 21) =>
    get<CsValidation>(`/api/rankings/${market}/validation?horizon=${horizon}`),

  rankingsV2: (market = "us", horizon = 21) =>
    get<RankingsResponse>(`/api/rankings/v2/${market}?horizon=${horizon}`),

  validationV2: (market = "us", horizon = 21, costBps = 10) =>
    get<V2Validation>(
      `/api/rankings/v2/${market}/validation?horizon=${horizon}&cost_bps=${costBps}`
    ),
};
