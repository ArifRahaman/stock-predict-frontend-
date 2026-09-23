"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
} from "lightweight-charts";
import type { Candle } from "@/lib/types";

interface Props {
  candles: Candle[];
  /** Optional Kalman de-noised trend, aligned to the tail of `candles`. */
  trend?: number[];
}

export function PriceChart({ candles, trend }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8b97ab",
        fontFamily: "inherit",
      },
      grid: {
        vertLines: { color: "#1a2130" },
        horzLines: { color: "#1a2130" },
      },
      rightPriceScale: { borderColor: "#232c3d" },
      timeScale: { borderColor: "#232c3d", timeVisible: false },
      crosshair: { mode: 1 },
      autoSize: true,
    });
    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26d07c",
      downColor: "#ff5d6c",
      borderUpColor: "#26d07c",
      borderDownColor: "#ff5d6c",
      wickUpColor: "#26d07c",
      wickDownColor: "#ff5d6c",
    });
    candleSeries.setData(
      candles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    if (trend && trend.length) {
      const offset = candles.length - trend.length;
      const trendData = trend
        .map((v, i) => {
          const idx = offset + i;
          if (idx < 0 || idx >= candles.length) return null;
          return { time: candles[idx].time, value: v };
        })
        .filter(Boolean) as { time: string; value: number }[];
      const line = chart.addSeries(LineSeries, {
        color: "#4f8cff",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      line.setData(trendData);
    }

    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [candles, trend]);

  return <div ref={ref} className="h-[380px] w-full" />;
}
