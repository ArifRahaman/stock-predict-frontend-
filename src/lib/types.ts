export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockDetail {
  info: {
    symbol: string;
    company_name?: string;
    exchange?: string;
    sector?: string;
    industry?: string;
    currency?: string;
  };
  last_price: number;
  change_pct: number;
  stats: Record<string, number>;
  candles: Candle[];
}

export interface PredictionComponent {
  model: string;
  predicted_return?: number;
  probability_up?: number;
  predicted_volatility?: number;
  horizon_volatility?: number;
  regime?: string;
  regime_expected_return?: number;
  trend?: number[];
  top_features?: { feature: string; importance: number }[];
  order?: number[];
  note?: string;
}

export interface Prediction {
  symbol: string;
  last_price: number;
  horizon: number;
  predicted_return: number;
  probability_up: number;
  predicted_volatility: number;
  regime: string;
  regime_conflict?: boolean;
  confidence: string;
  weights: Record<string, number>;
  models_used?: string[];
  models_unavailable?: string[];
  coverage?: number;
  components: Record<string, PredictionComponent>;
}

export interface MonteCarlo {
  symbol: string;
  last_price: number;
  days: number;
  n_paths: number;
  median: number;
  mean: number;
  p01: number;
  p05: number;
  p25: number;
  p75: number;
  p95: number;
  p99: number;
  probability_up: number;
  expected_return: number;
  sample_paths: number[][];
  drift_daily: number;
  drift_annual: number;
  drift_raw_annual: number;
  drift_shrinkage_weight: number;
  drift_t_stat: number;
  innovation: string;
  sigma_daily_start: number;
  sigma_daily_end: number;
}

export interface BacktestMetrics {
  model: string;
  horizon?: number;
  mae?: number;
  rmse?: number;
  directional_accuracy?: number;
  sharpe?: number;
  max_drawdown?: number;
  win_rate?: number;
  n_predictions?: number;
  effective_n?: number;
  reliable?: boolean;
  error?: string;
}

export interface BacktestResponse {
  symbol: string;
  horizon: number;
  results: Record<string, BacktestMetrics>;
}

export interface RankingRow {
  rank: number;
  symbol: string;
  price: number;
  /** v1 only: raw predicted excess return. */
  predicted_excess_return?: number;
  /** v2: risk-adjusted score (not a return forecast). */
  score?: number;
  percentile: number;
}

export interface V2Validation {
  market: string;
  horizon: number;
  universe_size: number;
  history_start: string;
  history_end: string;
  rank_ic: number;
  ic_t_stat: number;
  ic_t_stat_naive: number;
  ic_positive_days_pct: number;
  n_test_days: number;
  cost_bps_round_trip: number;
  rebalance_every: number;
  n_rebalances: number;
  annualised_gross_pct: number;
  annualised_net_pct: number;
  net_sharpe: number;
  net_t_stat: number;
  max_drawdown: number;
  yearly_net_pct: Record<string, number>;
  profitable_years: string;
  significant_after_costs: boolean;
  error?: string;
}

export interface RankingsResponse {
  market: string;
  horizon: number;
  as_of: string;
  trained_through: string;
  universe_size: number;
  rankings: RankingRow[];
  top_features: { feature: string; importance: number }[];
}

export interface CsValidation {
  market: string;
  horizon: number;
  rank_ic: number;
  ic_std: number;
  ic_t_stat: number;
  ic_t_stat_naive?: number;
  effective_independent_periods?: number;
  ic_positive_days_pct: number;
  decile_spread: number;
  top_decile_mean: number;
  bottom_decile_mean: number;
  directional_accuracy: number;
  n_predictions: number;
  n_test_days: number;
  statistically_significant: boolean;
  error?: string;
}
