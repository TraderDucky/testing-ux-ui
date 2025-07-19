import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

// CandlestickData type for chart
export type CandlestickData = {
  time: number; // UNIX timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
};

interface Props {
  data: CandlestickData[];
  dark?: boolean;
  height?: number;
}

const CandlestickChart: React.FC<Props> = ({ data, dark = true, height = 400 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: dark ? '#181a20' : '#fff' },
        textColor: dark ? '#D9D9D9' : '#222',
      },
      grid: {
        vertLines: { color: dark ? '#23262f' : '#eee' },
        horzLines: { color: dark ? '#23262f' : '#eee' },
      },
      timeScale: { timeVisible: true, secondsVisible: false },
    });
    chartRef.current = chart;
    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(data);
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, dark, height]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: '100%', height, minHeight: 300, background: dark ? '#181a20' : '#fff' }}
    />
  );
};

export default CandlestickChart; 