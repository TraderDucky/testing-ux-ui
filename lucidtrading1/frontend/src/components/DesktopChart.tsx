import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';
import { Box, Typography, Paper } from '@mui/material';

interface ChartData {
  candles: CandlestickData[];
  vwap?: number[];
  ema9?: number[];
  sr_levels?: number[];
}

interface DesktopChartProps {
  data: ChartData;
  timeframe: string;
  height: number;
  width: number;
  title: string;
  showVolume?: boolean;
  showIndicators?: boolean;
}

export default function DesktopChart({ 
  data, 
  timeframe, 
  height, 
  width, 
  title, 
  showVolume = true,
  showIndicators = true 
}: DesktopChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const vwapSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { color: '#23262f' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series if enabled
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      volumeSeriesRef.current = volumeSeries;
    }

    // Add indicators if enabled
    if (showIndicators) {
      // VWAP line
      if (data.vwap) {
        const vwapSeries = chart.addLineSeries({
          color: '#2962ff',
          lineWidth: 2,
          title: 'VWAP',
        });
        vwapSeriesRef.current = vwapSeries;
      }

      // EMA9 line
      if (data.ema9) {
        const emaSeries = chart.addLineSeries({
          color: '#ff9800',
          lineWidth: 2,
          title: 'EMA9',
        });
        emaSeriesRef.current = emaSeries;
      }
    }

    // Add support/resistance levels
    if (data.sr_levels && data.sr_levels.length > 0) {
      data.sr_levels.forEach((level, index) => {
        const lineSeries = chart.addLineSeries({
          color: '#ff5722',
          lineWidth: 1,
          lineStyle: 1, // Dashed
          title: `SR ${index + 1}`,
        });
        
        if (data.candles.length > 0) {
          const lineData: LineData[] = data.candles.map(candle => ({
            time: candle.time,
            value: level,
          }));
          lineSeries.setData(lineData);
        }
      });
    }

    return () => {
      chart.remove();
    };
  }, [width, height, showVolume, showIndicators]);

  useEffect(() => {
    if (!candlestickSeriesRef.current) return;

    // Update candlestick data
    candlestickSeriesRef.current.setData(data.candles);

    // Update volume data
    if (volumeSeriesRef.current && data.candles.length > 0) {
      const volumeData = data.candles.map(candle => ({
        time: candle.time,
        value: (candle as any).volume || 0,
        color: (candle as any).close >= (candle as any).open ? '#26a69a' : '#ef5350',
      }));
      volumeSeriesRef.current.setData(volumeData);
    }

    // Update VWAP data
    if (vwapSeriesRef.current && data.vwap && data.candles.length > 0) {
      const vwapData: LineData[] = data.candles.map((candle, index) => ({
        time: candle.time,
        value: data.vwap![index],
      }));
      vwapSeriesRef.current.setData(vwapData);
    }

    // Update EMA data
    if (emaSeriesRef.current && data.ema9 && data.candles.length > 0) {
      const emaData: LineData[] = data.candles.map((candle, index) => ({
        time: candle.time,
        value: data.ema9![index],
      }));
      emaSeriesRef.current.setData(emaData);
    }
  }, [data]);

  return (
    <Paper sx={{ p: 2, bgcolor: '#23262f', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 700 }}>
        {title} ({timeframe})
      </Typography>
      <Box ref={chartContainerRef} sx={{ width: '100%', height: height }} />
    </Paper>
  );
} 