"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useStock(symbol: string, period = "2y") {
  return useQuery({
    queryKey: ["stock", symbol, period],
    queryFn: () => api.stock(symbol, period),
    enabled: !!symbol,
  });
}

export function usePrediction(symbol: string, horizon = 1) {
  return useQuery({
    queryKey: ["prediction", symbol, horizon],
    queryFn: () => api.prediction(symbol, horizon),
    enabled: !!symbol,
  });
}

export function useMonteCarlo(symbol: string, days = 21) {
  return useQuery({
    queryKey: ["montecarlo", symbol, days],
    queryFn: () => api.monteCarlo(symbol, days),
    enabled: !!symbol,
  });
}

export function useRankings(market: string, horizon: number) {
  return useQuery({
    queryKey: ["rankings", market, horizon],
    queryFn: () => api.rankings(market, horizon),
  });
}

export function useCsValidation(market: string, horizon: number) {
  return useQuery({
    queryKey: ["csvalidation", market, horizon],
    queryFn: () => api.csValidation(market, horizon),
  });
}

export function useBacktest(symbol: string, models?: string, horizon = 1) {
  return useQuery({
    queryKey: ["backtest", symbol, models, horizon],
    queryFn: () => api.backtest(symbol, models, horizon),
    enabled: !!symbol,
  });
}
