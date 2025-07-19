import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Box, Paper, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Alert, CssBaseline
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DesktopChart from './DesktopChart';
import type { CandlestickData, Time } from 'lightweight-charts';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2962ff' },
    background: { default: '#181a20', paper: '#23262f' },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h6: { fontWeight: 700 },
  },
});

interface ChartData {
  candles: CandlestickData[];
  vwap?: number[];
  ema9?: number[];
  sr_levels?: number[];
}

interface MultiTimeframeData {
  '1min': ChartData;
  '1hour': ChartData;
  '1day': ChartData;
}

const SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];

export default function DesktopApp() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [chartData, setChartData] = useState<MultiTimeframeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch chart data
  const fetchChartData = async (symbol: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data for symbol:', symbol);
      const response = await fetch(`http://localhost:5000/chart_data/${symbol}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      // Transform data to match our interface
      const transformedData: MultiTimeframeData = {
        '1min': {
          candles: data['1min']?.candles || [],
          vwap: data['1min']?.candles?.map((c: any) => c.vwap).filter(Boolean) || [],
          ema9: data['1min']?.candles?.map((c: any) => c.ema9).filter(Boolean) || [],
        },
        '1hour': {
          candles: data['1hour']?.candles || [],
          vwap: data['1hour']?.candles?.map((c: any) => c.vwap).filter(Boolean) || [],
          ema9: data['1hour']?.candles?.map((c: any) => c.ema9).filter(Boolean) || [],
        },
        '1day': {
          candles: data['1day']?.candles || [],
          vwap: data['1day']?.candles?.map((c: any) => c.vwap).filter(Boolean) || [],
          ema9: data['1day']?.candles?.map((c: any) => c.ema9).filter(Boolean) || [],
          sr_levels: data['1day']?.sr_levels || [],
        },
      };
      
      console.log('Transformed data:', transformedData);
      setChartData(transformedData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      
      // Create fallback data for testing
      const fallbackData: MultiTimeframeData = {
        '1min': {
          candles: [
            { time: (Math.floor(Date.now() / 1000) - 3600) as Time, open: 100, high: 102, low: 99, close: 101 },
            { time: (Math.floor(Date.now() / 1000) - 1800) as Time, open: 101, high: 103, low: 100, close: 102 },
            { time: Math.floor(Date.now() / 1000) as Time, open: 102, high: 104, low: 101, close: 103 },
          ],
          vwap: [100.5, 101.2, 102.1],
          ema9: [100.3, 101.0, 101.8],
        },
        '1hour': {
          candles: [
            { time: (Math.floor(Date.now() / 1000) - 7200) as Time, open: 100, high: 102, low: 99, close: 101 },
            { time: (Math.floor(Date.now() / 1000) - 3600) as Time, open: 101, high: 103, low: 100, close: 102 },
            { time: Math.floor(Date.now() / 1000) as Time, open: 102, high: 104, low: 101, close: 103 },
          ],
          vwap: [100.5, 101.2, 102.1],
          ema9: [100.3, 101.0, 101.8],
        },
        '1day': {
          candles: [
            { time: (Math.floor(Date.now() / 1000) - 86400) as Time, open: 100, high: 102, low: 99, close: 101 },
            { time: (Math.floor(Date.now() / 1000) - 43200) as Time, open: 101, high: 103, low: 100, close: 102 },
            { time: Math.floor(Date.now() / 1000) as Time, open: 102, high: 104, low: 101, close: 103 },
          ],
          vwap: [100.5, 101.2, 102.1],
          ema9: [100.3, 101.0, 101.8],
          sr_levels: [99, 104],
        },
      };
      setChartData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when symbol changes
  useEffect(() => {
    fetchChartData(selectedSymbol);
  }, [selectedSymbol]);

  // Calculate chart dimensions based on window size
  const chartHeight = Math.floor((windowSize.height - 120) * 0.4); // 40% of available height
  const mainChartWidth = Math.floor(windowSize.width * 0.7); // 70% of window width
  const sideChartWidth = Math.floor(windowSize.width * 0.28); // 28% of window width

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Box sx={{ width: 32, height: 32, bgcolor: '#23262f', borderRadius: 2, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUpIcon fontSize="medium" sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TradeReflex Desktop
          </Typography>
          <FormControl sx={{ minWidth: 120, bgcolor: '#23262f', borderRadius: 1 }}>
            <InputLabel sx={{ color: '#fff' }}>Symbol</InputLabel>
            <Select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              sx={{ color: '#fff', '& .MuiSelect-icon': { color: '#fff' } }}
            >
              {SYMBOLS.map((symbol) => (
                <MenuItem key={symbol} value={symbol}>
                  {symbol}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : chartData ? (
          <Box sx={{ display: 'flex', gap: 2, height: windowSize.height - 120 }}>
            {/* Main 1-Minute Chart (70% width) */}
            <Box sx={{ flex: '0 0 70%' }}>
              <DesktopChart
                data={chartData['1min']}
                timeframe="1min"
                height={windowSize.height - 120}
                width={mainChartWidth}
                title={`${selectedSymbol} - 1 Minute`}
                showVolume={true}
                showIndicators={true}
              />
            </Box>

            {/* Right Side Charts (30% width) */}
            <Box sx={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Daily Chart (Top) */}
              <Box sx={{ flex: '0 0 50%' }}>
                <DesktopChart
                  data={chartData['1day']}
                  timeframe="1day"
                  height={Math.floor((windowSize.height - 120) * 0.48)}
                  width={sideChartWidth}
                  title={`${selectedSymbol} - Daily`}
                  showVolume={true}
                  showIndicators={true}
                />
              </Box>

              {/* Hourly Chart (Bottom) */}
              <Box sx={{ flex: '0 0 50%' }}>
                <DesktopChart
                  data={chartData['1hour']}
                  timeframe="1hour"
                  height={Math.floor((windowSize.height - 120) * 0.48)}
                  width={sideChartWidth}
                  title={`${selectedSymbol} - Hourly`}
                  showVolume={true}
                  showIndicators={true}
                />
              </Box>
            </Box>
          </Box>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#23262f' }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
              No chart data available
            </Typography>
            <Typography variant="body2" sx={{ color: '#aaa' }}>
              Select a symbol to load chart data
            </Typography>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
} 