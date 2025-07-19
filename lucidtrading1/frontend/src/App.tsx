import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Button, Tabs, Tab, Box, Card, CardContent, IconButton, Divider, Grid, CssBaseline, LinearProgress, Slide, Paper
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CandlestickChart from './components/CandlestickChart';
import DesktopApp from './components/DesktopApp';

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

const MODES = [
  { label: 'Speed Mode', description: '5s trades, instant feedback' },
  { label: 'Risk Manager', description: 'Fast stop/TP, position sizing' },
  { label: 'Pattern Snap', description: 'Pattern recognition drills' },
];

// Simulate a scenario: 20 candles, answer is "buy" if last 3 go up, "sell" if down, else "skip"
function generateScenario(): Scenario {
  const candles = [];
  let price = 100 + Math.random() * 10;
  for (let i = 0; i < 20; i++) {
    const open = price;
    const close = open + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();
    candles.push({
      time: Math.floor(Date.now() / 1000) + i * 60,
      open,
      high,
      low,
      close,
    });
    price = close;
  }
  // Determine answer
  const last = candles.slice(-4);
  const diff = last[3].close - last[0].close;
  let answer: 'buy' | 'sell' | 'skip' = 'skip';
  if (diff > 1) answer = 'buy';
  else if (diff < -1) answer = 'sell';
  return { candles, answer, pattern: diff > 1 ? 'trend up' : diff < -1 ? 'trend down' : 'neutral' };
}

// 1. Add Risk Manager scenario generator and types
function generateRiskScenario() {
  // Simulate a scenario: random entry, stop, and TP zones
  const candles = [];
  let price = 100 + Math.random() * 10;
  for (let i = 0; i < 20; i++) {
    const open = price;
    const close = open + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();
    candles.push({
      time: Math.floor(Date.now() / 1000) + i * 60,
      open,
      high,
      low,
      close,
    });
    price = close;
  }
  // Pick entry at last candle, random direction
  const entryIdx = 18;
  const entry = candles[entryIdx].close;
  const direction = Math.random() > 0.5 ? 'long' : 'short';
  // Simulate a realistic stop/TP range
  const stop = direction === 'long' ? entry - (0.5 + Math.random() * 1.5) : entry + (0.5 + Math.random() * 1.5);
  const tp = direction === 'long' ? entry + (1 + Math.random() * 2) : entry - (1 + Math.random() * 2);
  // Simulate outcome: did price hit stop or TP first in next 2 candles?
  const next = candles.slice(entryIdx + 1);
  let outcome = 'none';
  for (const c of next) {
    if (direction === 'long') {
      if (c.low <= stop) { outcome = 'stop'; break; }
      if (c.high >= tp) { outcome = 'tp'; break; }
    } else {
      if (c.high >= stop) { outcome = 'stop'; break; }
      if (c.low <= tp) { outcome = 'tp'; break; }
    }
  }
  return {
    candles,
    entry,
    direction,
    stop,
    tp,
    outcome, // 'tp', 'stop', or 'none'
    rr: Math.abs((tp - entry) / (entry - stop)),
  };
}

type RiskScenario = ReturnType<typeof generateRiskScenario>;

type CandlestickData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};
type Scenario = {
  candles: CandlestickData[];
  answer: 'buy' | 'sell' | 'skip';
  pattern: string;
};

// 1. Add Pattern Snap scenario generator and types
const PATTERN_TYPES = [
  'Bull Flag',
  'Bear Flag',
  'Double Top',
  'Double Bottom',
  'Head & Shoulders',
  'Ascending Triangle',
  'Symmetrical Triangle',
  'No Pattern'
] as const;

type PatternType = typeof PATTERN_TYPES[number];

type PatternScenario = {
  candles: CandlestickData[];
  pattern: PatternType;
  timeframe: '1m' | '5m' | '15m';
};

function generatePatternScenario(): PatternScenario {
  const candles = [];
  let price = 100 + Math.random() * 10;
  const patternType = PATTERN_TYPES[Math.floor(Math.random() * PATTERN_TYPES.length)];

  // Generate 25 candles with pattern-specific logic
  for (let i = 0; i < 25; i++) {
    let open, close, high, low;

    if (patternType === 'Bull Flag') {
      // Strong uptrend, then consolidation
      if (i < 15) {
        open = price;
        close = open + (0.5 + Math.random() * 1.5);
        price = close;
      } else {
        open = price;
        close = open + (Math.random() - 0.5) * 0.5;
        price = close;
      }
    } else if (patternType === 'Bear Flag') {
      // Strong downtrend, then consolidation
      if (i < 15) {
        open = price;
        close = open - (0.5 + Math.random() * 1.5);
        price = close;
      } else {
        open = price;
        close = open + (Math.random() - 0.5) * 0.5;
        price = close;
      }
    } else if (patternType === 'Double Top') {
      // Two peaks at similar levels
      if (i < 8 || (i > 12 && i < 18)) {
        open = price;
        close = open + (0.5 + Math.random() * 1);
        price = close;
      } else {
        open = price;
        close = open - (0.3 + Math.random() * 0.7);
        price = close;
      }
    } else if (patternType === 'Double Bottom') {
      // Two troughs at similar levels
      if (i < 8 || (i > 12 && i < 18)) {
        open = price;
        close = open - (0.5 + Math.random() * 1);
        price = close;
      } else {
        open = price;
        close = open + (0.3 + Math.random() * 0.7);
        price = close;
      }
    } else if (patternType === 'Head & Shoulders') {
      // Three peaks: left shoulder, head (highest), right shoulder
      if (i < 6) {
        open = price;
        close = open + (0.3 + Math.random() * 0.7);
        price = close;
      } else if (i < 12) {
        open = price;
        close = open + (0.5 + Math.random() * 1);
        price = close;
      } else if (i < 18) {
        open = price;
        close = open + (0.3 + Math.random() * 0.7);
        price = close;
      } else {
        open = price;
        close = open - (0.2 + Math.random() * 0.5);
        price = close;
      }
    } else if (patternType === 'Ascending Triangle') {
      // Higher lows, flat resistance
      const resistance = price + 3;
      if (i % 3 === 0) {
        open = price;
        close = Math.min(resistance, open + (0.5 + Math.random() * 1));
        price = close;
      } else {
        open = price;
        close = open + (Math.random() - 0.3) * 0.8;
        price = Math.max(price * 0.98, close);
      }
    } else if (patternType === 'Symmetrical Triangle') {
      // Converging highs and lows
      const convergence = 1 - (i / 25) * 0.5;
      open = price;
      close = open + (Math.random() - 0.5) * 2 * convergence;
      price = close;
    } else {
      // No Pattern - random walk
      open = price;
      close = open + (Math.random() - 0.5) * 2;
      price = close;
    }

    high = Math.max(open, close) + Math.random() * 0.5;
    low = Math.min(open, close) - Math.random() * 0.5;

    candles.push({
      time: Math.floor(Date.now() / 1000) + i * 60,
      open,
      high,
      low,
      close,
    });
  }

  return {
    candles,
    pattern: patternType,
    timeframe: ['1m', '5m', '15m'][Math.floor(Math.random() * 3)] as '1m' | '5m' | '15m',
  };
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'session' | 'summary' | 'desktop'>('home');
  const [mode, setMode] = useState(0);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [current, setCurrent] = useState(0);
  const [timer, setTimer] = useState(5);
  const [userAction, setUserAction] = useState<'buy' | 'sell' | 'skip' | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string } | null>(null);
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // 2. Add state for Risk Manager Mode
  const [riskScenarios, setRiskScenarios] = useState<RiskScenario[]>([]);
  const [riskCurrent, setRiskCurrent] = useState(0);
  const [riskTimer, setRiskTimer] = useState(10);
  const [riskUser, setRiskUser] = useState<{size: number; stop: number; tp: number} | null>(null);
  const [riskFeedback, setRiskFeedback] = useState<{ correct: boolean; reason: string; outcome: string } | null>(null);
  const [riskXP, setRiskXP] = useState(0);
  const [riskStreak, setRiskStreak] = useState(0);
  const [riskReactionTimes, setRiskReactionTimes] = useState<number[]>([]);
  const riskTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [riskStartTime, setRiskStartTime] = useState<number>(0);

  // 2. Add state for Pattern Snap Mode
  const [patternScenarios, setPatternScenarios] = useState<PatternScenario[]>([]);
  const [patternCurrent, setPatternCurrent] = useState(0);
  const [patternTimer, setPatternTimer] = useState(7);
  const [patternUser, setPatternUser] = useState<PatternType | null>(null);
  const [patternFeedback, setPatternFeedback] = useState<{ correct: boolean; answer: PatternType; selected: PatternType } | null>(null);
  const [patternXP, setPatternXP] = useState(0);
  const [patternStreak, setPatternStreak] = useState(0);
  const [patternReactionTimes, setPatternReactionTimes] = useState<number[]>([]);
  const [patternMastery, setPatternMastery] = useState<Record<PatternType, { correct: number; total: number; avgTime: number }>>(
    PATTERN_TYPES.reduce((acc, pattern) => ({ ...acc, [pattern]: { correct: 0, total: 0, avgTime: 0 } }), {} as Record<PatternType, { correct: number; total: number; avgTime: number }>)
  );
  const patternTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [patternStartTime, setPatternStartTime] = useState<number>(0);

  // 3. Update startSession to branch by mode
  const startSession = () => {
    if (mode === 1) { // Risk Manager
      const scens = Array.from({ length: 10 }, generateRiskScenario);
      setRiskScenarios(scens);
      setRiskCurrent(0);
      setRiskXP(0);
      setRiskStreak(0);
      setRiskReactionTimes([]);
      setScreen('session');
      setRiskUser(null);
      setRiskFeedback(null);
      setRiskTimer(10);
      setRiskStartTime(Date.now());
    } else if (mode === 2) { // Pattern Snap
      const scens = Array.from({ length: 15 }, generatePatternScenario);
      setPatternScenarios(scens);
      setPatternCurrent(0);
      setPatternXP(0);
      setPatternStreak(0);
      setPatternReactionTimes([]);
      setScreen('session');
      setPatternUser(null);
      setPatternFeedback(null);
      setPatternTimer(7);
      setPatternStartTime(Date.now());
    } else { // Speed Mode
      const scens = Array.from({ length: 10 }, generateScenario);
      setScenarios(scens);
      setCurrent(0);
      setXP(0);
      setStreak(0);
      setReactionTimes([]);
      setScreen('session');
      setUserAction(null);
      setFeedback(null);
      setTimer(5);
      setStartTime(Date.now());
    }
  };

  // 4. Risk Manager timer logic
  useEffect(() => {
    if (screen !== 'session' || mode !== 1 || riskUser) return;
    setRiskTimer(10);
    setRiskStartTime(Date.now());
    riskTimerRef.current && clearInterval(riskTimerRef.current);
    riskTimerRef.current = setInterval(() => {
      setRiskTimer(t => {
        if (t <= 1) {
          clearInterval(riskTimerRef.current!);
          handleRiskSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (riskTimerRef.current) clearInterval(riskTimerRef.current);
    };
    // eslint-disable-next-line
  }, [riskCurrent, screen, mode]);

  // 5. Risk Manager handle submit
  function handleRiskSubmit(timeout = false) {
    if (riskUser || !riskScenarios[riskCurrent]) return;
    // For timeout, use default values
    const user = riskUser || { size: 1, stop: riskScenarios[riskCurrent].entry - (riskScenarios[riskCurrent].direction === 'long' ? 1 : -1), tp: riskScenarios[riskCurrent].entry + (riskScenarios[riskCurrent].direction === 'long' ? 2 : -2) };
    riskTimerRef.current && clearInterval(riskTimerRef.current!);
    const scenario = riskScenarios[riskCurrent];
    // Evaluate: correct direction, stop < entry < tp (long) or tp < entry < stop (short), RR >= 1.5, and outcome
    let correct = false;
    let reason = '';
    const rr = Math.abs((user.tp - scenario.entry) / (scenario.entry - user.stop));
    if (scenario.direction === 'long') {
      if (user.stop >= scenario.entry || user.tp <= scenario.entry) {
        reason = 'Stop/TP not valid';
      } else if (rr < 1.5) {
        reason = 'RR < 1.5';
      } else {
        correct = true;
        reason = scenario.outcome === 'tp' ? 'TP hit!' : scenario.outcome === 'stop' ? 'Stopped out' : 'No outcome';
      }
    } else {
      if (user.stop <= scenario.entry || user.tp >= scenario.entry) {
        reason = 'Stop/TP not valid';
      } else if (rr < 1.5) {
        reason = 'RR < 1.5';
      } else {
        correct = true;
        reason = scenario.outcome === 'tp' ? 'TP hit!' : scenario.outcome === 'stop' ? 'Stopped out' : 'No outcome';
      }
    }
    setRiskUser(user);
    setRiskFeedback({ correct, reason, outcome: scenario.outcome });
    setRiskXP(riskXP + (correct ? 10 : -5));
    setRiskStreak(correct ? riskStreak + 1 : 0);
    if (!timeout) setRiskReactionTimes([...riskReactionTimes, 10 - riskTimer]);
    setTimeout(() => {
      if (riskCurrent + 1 < riskScenarios.length) {
        setRiskCurrent(riskCurrent + 1);
        setRiskUser(null);
        setRiskFeedback(null);
        setRiskTimer(10);
      } else {
        setScreen('summary');
      }
    }, 1500);
  }

  // Timer logic
  useEffect(() => {
    if (screen !== 'session' || userAction) return;
    setTimer(5);
    setStartTime(Date.now());
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAction('skip', true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, [current, screen]);

  // Handle user action
  function handleAction(action: 'buy' | 'sell' | 'skip', timeout = false) {
    if (userAction) return;
    setUserAction(action);
    timerRef.current && clearInterval(timerRef.current!);
    const scenario = scenarios[current];
    const correct = action === scenario.answer;
    setFeedback({ correct, answer: scenario.answer });
    setXP(xp + (correct ? 10 : -5));
    setStreak(correct ? streak + 1 : 0);
    if (!timeout) setReactionTimes([...reactionTimes, 5 - timer]);
    setTimeout(() => {
      if (current + 1 < scenarios.length) {
        setCurrent(current + 1);
        setUserAction(null);
        setFeedback(null);
        setTimer(5);
      } else {
        setScreen('summary');
      }
    }, 1500);
  }

  // 4. Pattern Snap timer logic
  useEffect(() => {
    if (screen !== 'session' || mode !== 2 || patternUser) return;
    setPatternTimer(7);
    setPatternStartTime(Date.now());
    patternTimerRef.current && clearInterval(patternTimerRef.current);
    patternTimerRef.current = setInterval(() => {
      setPatternTimer(t => {
        if (t <= 1) {
          clearInterval(patternTimerRef.current!);
          handlePatternSubmit('No Pattern', true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (patternTimerRef.current) clearInterval(patternTimerRef.current);
    };
    // eslint-disable-next-line
  }, [patternCurrent, screen, mode]);

  // 5. Pattern Snap handle submit
  function handlePatternSubmit(selected: PatternType, timeout = false) {
    if (patternUser || !patternScenarios[patternCurrent]) return;
    patternTimerRef.current && clearInterval(patternTimerRef.current!);
    const scenario = patternScenarios[patternCurrent];
    const correct = selected === scenario.pattern;
    setPatternUser(selected);
    setPatternFeedback({ correct, answer: scenario.pattern, selected });
    setPatternXP(patternXP + (correct ? 10 : -5));
    setPatternStreak(correct ? patternStreak + 1 : 0);

    // Update pattern mastery
    const mastery = patternMastery[scenario.pattern];
    const newMastery = {
      correct: mastery.correct + (correct ? 1 : 0),
      total: mastery.total + 1,
      avgTime: mastery.avgTime === 0 ? (7 - patternTimer) : (mastery.avgTime * mastery.total + (7 - patternTimer)) / (mastery.total + 1)
    };
    setPatternMastery({ ...patternMastery, [scenario.pattern]: newMastery });

    if (!timeout) setPatternReactionTimes([...patternReactionTimes, 7 - patternTimer]);
    setTimeout(() => {
      if (patternCurrent + 1 < patternScenarios.length) {
        setPatternCurrent(patternCurrent + 1);
        setPatternUser(null);
        setPatternFeedback(null);
        setPatternTimer(7);
      } else {
        setScreen('summary');
      }
    }, 1500);
  }

  // Home Screen
  if (screen === 'home') {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AppBar position="static" color="primary" elevation={2}>
          <Toolbar>
            <Box sx={{ width: 32, height: 32, bgcolor: '#23262f', borderRadius: 2, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUpIcon fontSize="medium" sx={{ color: '#fff' }} />
            </Box>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              TradeReflex
            </Typography>
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="xs">
            <Card sx={{ borderRadius: 4, boxShadow: 4, p: 2, mt: 6 }}>
              <CardContent>
                <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                  Sharpen Your Trading Reflexes
                </Typography>
                <Tabs
                  value={mode}
                  onChange={(_, v) => setMode(v)}
                  variant="fullWidth"
                  sx={{
                    mb: 2,
                    '.MuiTabs-indicator': { backgroundColor: '#2962ff' },
                    '.MuiTab-root': { color: '#aaa', fontWeight: 600 },
                    '.Mui-selected': { color: '#2962ff !important' },
                  }}
                >
                  {MODES.map((m, i) => (
                    <Tab key={m.label} label={m.label} />
                  ))}
                </Tabs>
                <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
                  {MODES[mode].description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ borderRadius: 99, py: 1.5, fontWeight: 700, fontSize: 18, mb: 2 }}
                  onClick={startSession}
                >
                  Start Session
                </Button>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 2 }}>
                  <Box textAlign="center" sx={{ flex: 1 }}>
                    <WhatshotIcon sx={{ color: '#26a69a', mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">Accuracy</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>92%</Typography>
                  </Box>
                  <Box textAlign="center" sx={{ flex: 1 }}>
                    <SpeedIcon sx={{ color: '#2962ff', mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">Avg. Speed</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>1.8s</Typography>
                  </Box>
                  <Box textAlign="center" sx={{ flex: 1 }}>
                    <TrendingUpIcon sx={{ color: '#ef5350', mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">Streak</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>7</Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<EmojiEventsIcon />}
                  sx={{ borderRadius: 99, mt: 3, fontWeight: 600 }}
                >
                  Daily Challenge
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  sx={{ borderRadius: 99, mt: 2, fontWeight: 600 }}
                  onClick={() => setScreen('desktop')}
                >
                  Desktop Charts
                </Button>
              </CardContent>
            </Card>
            <Typography align="center" color="text.secondary" sx={{ mt: 4, fontSize: 13 }}>
              Powered by LucidTrading
            </Typography>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  // Desktop App Screen
  if (screen === 'desktop') {
    return <DesktopApp />;
  }

  // Training Session Screen
  if (screen === 'session') {
    if (mode === 1) {
      // RISK MANAGER MODE UI
      const scenario = riskScenarios[riskCurrent];
      if (!scenario) return null;
      // Sliders: position size (1-10), stop (entry-5% to entry-0.5%), tp (entry+0.5% to entry+5%)
      const entry = scenario.entry;
      const minStop = scenario.direction === 'long' ? entry - entry * 0.05 : entry + entry * 0.005;
      const maxStop = scenario.direction === 'long' ? entry - entry * 0.005 : entry + entry * 0.05;
      const minTP = scenario.direction === 'long' ? entry + entry * 0.005 : entry - entry * 0.05;
      const maxTP = scenario.direction === 'long' ? entry + entry * 0.05 : entry - entry * 0.005;
      return (
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <AppBar position="static" color="primary" elevation={2}>
            <Toolbar>
              <Box sx={{ width: 32, height: 32, bgcolor: '#23262f', borderRadius: 2, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUpIcon fontSize="medium" sx={{ color: '#fff' }} />
              </Box>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Risk Manager
              </Typography>
              <Typography variant="body2" color="inherit">
                {riskCurrent + 1}/{riskScenarios.length}
              </Typography>
            </Toolbar>
          </AppBar>
          <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="sm">
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(riskTimer / 10) * 100}
                    sx={{ height: 8, borderRadius: 4, mb: 1, bgcolor: '#23262f' }}
                    color={riskTimer <= 3 ? 'error' : 'primary'}
                  />
                  <Typography align="center" sx={{ fontWeight: 700, fontSize: 18 }}>
                    {riskTimer}s
                  </Typography>
                  <Typography align="center" color="text.secondary" sx={{ fontSize: 14 }}>
                    Direction: {scenario.direction.toUpperCase()} | Entry: {entry.toFixed(2)}
                  </Typography>
                  <Typography align="center" color="text.secondary" sx={{ fontSize: 14 }}>
                    Set Stop, Take Profit, and Position Size
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <CandlestickChart data={scenario.candles} />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>Position Size: {riskUser?.size ?? 1}x</Typography>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={riskUser?.size ?? 1}
                    disabled={!!riskUser}
                    onChange={e => setRiskUser({ ...(riskUser || { size: 1, stop: minStop, tp: minTP }), size: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                  <Typography gutterBottom>Stop Loss: {riskUser?.stop?.toFixed(2) ?? minStop.toFixed(2)}</Typography>
                  <input
                    type="range"
                    min={Math.min(minStop, maxStop)}
                    max={Math.max(minStop, maxStop)}
                    step={0.01}
                    value={riskUser?.stop ?? minStop}
                    disabled={!!riskUser}
                    onChange={e => setRiskUser({ ...(riskUser || { size: 1, stop: minStop, tp: minTP }), stop: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                  <Typography gutterBottom>Take Profit: {riskUser?.tp?.toFixed(2) ?? minTP.toFixed(2)}</Typography>
                  <input
                    type="range"
                    min={Math.min(minTP, maxTP)}
                    max={Math.max(minTP, maxTP)}
                    step={0.01}
                    value={riskUser?.tp ?? minTP}
                    disabled={!!riskUser}
                    onChange={e => setRiskUser({ ...(riskUser || { size: 1, stop: minStop, tp: minTP }), tp: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!!riskUser}
                    sx={{ borderRadius: 99, minWidth: 120, fontWeight: 700, fontSize: 18 }}
                    onClick={() => handleRiskSubmit(false)}
                  >
                    Submit
                  </Button>
                </Box>
                <Slide direction="up" in={!!riskFeedback} mountOnEnter unmountOnExit>
                  <Paper sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: riskFeedback?.correct ? '#26a69a' : '#ef5350' }}>
                    <Typography align="center" sx={{ fontWeight: 700, fontSize: 20 }}>
                      {riskFeedback?.correct ? 'Correct!' : 'Missed!'}
                    </Typography>
                    <Typography align="center" sx={{ fontSize: 16 }}>
                      {riskFeedback?.correct
                        ? '+10 XP'
                        : `Reason: ${riskFeedback?.reason}  (-5 XP)`}
                    </Typography>
                    <Typography align="center" sx={{ fontSize: 14, mt: 1 }}>
                      Streak: {riskStreak}
                    </Typography>
                  </Paper>
                </Slide>
              </Paper>
            </Container>
          </Box>
        </ThemeProvider>
      );
    } else if (mode === 2) {
      // PATTERN SNAP MODE UI
      const scenario = patternScenarios[patternCurrent];
      if (!scenario) return null;
      
      // Generate 4 random options including the correct answer
      const options = [scenario.pattern];
      while (options.length < 4) {
        const randomPattern = PATTERN_TYPES[Math.floor(Math.random() * PATTERN_TYPES.length)];
        if (!options.includes(randomPattern)) {
          options.push(randomPattern);
        }
      }
      // Shuffle options
      const shuffledOptions = options.sort(() => Math.random() - 0.5);
      
      return (
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <AppBar position="static" color="primary" elevation={2}>
            <Toolbar>
              <Box sx={{ width: 32, height: 32, bgcolor: '#23262f', borderRadius: 2, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUpIcon fontSize="medium" sx={{ color: '#fff' }} />
              </Box>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Pattern Snap
              </Typography>
              <Typography variant="body2" color="inherit">
                {patternCurrent + 1}/{patternScenarios.length}
              </Typography>
            </Toolbar>
          </AppBar>
          <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="sm">
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(patternTimer / 7) * 100}
                    sx={{ height: 8, borderRadius: 4, mb: 1, bgcolor: '#23262f' }}
                    color={patternTimer <= 2 ? 'error' : 'primary'}
                  />
                  <Typography align="center" sx={{ fontWeight: 700, fontSize: 18 }}>
                    {patternTimer}s
                  </Typography>
                  <Typography align="center" color="text.secondary" sx={{ fontSize: 14 }}>
                    Timeframe: {scenario.timeframe} | Identify the Pattern
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <CandlestickChart data={scenario.candles} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  {shuffledOptions.map(option => (
                    <Button
                      key={option}
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={!!patternUser}
                      sx={{ 
                        borderRadius: 2, 
                        py: 1.5, 
                        fontWeight: 700, 
                        fontSize: 14,
                        textTransform: 'none',
                        bgcolor: patternUser === option ? (patternFeedback?.correct ? '#26a69a' : '#ef5350') : undefined
                      }}
                      onClick={() => handlePatternSubmit(option, false)}
                    >
                      {option}
                    </Button>
                  ))}
                </Box>
                <Slide direction="up" in={!!patternFeedback} mountOnEnter unmountOnExit>
                  <Paper sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: patternFeedback?.correct ? '#26a69a' : '#ef5350' }}>
                    <Typography align="center" sx={{ fontWeight: 700, fontSize: 20 }}>
                      {patternFeedback?.correct ? '✅ Correct!' : '⛔ Nope!'}
                    </Typography>
                    <Typography align="center" sx={{ fontSize: 16 }}>
                      {patternFeedback?.correct
                        ? `It's a ${patternFeedback?.answer}`
                        : `That was a ${patternFeedback?.answer}`}
                    </Typography>
                    <Typography align="center" sx={{ fontSize: 14, mt: 1 }}>
                      {patternFeedback?.correct ? '+10 XP' : '-5 XP'} | Streak: {patternStreak}
                    </Typography>
                  </Paper>
                </Slide>
              </Paper>
            </Container>
          </Box>
        </ThemeProvider>
      );
    }
    const scenario = scenarios[current];
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AppBar position="static" color="primary" elevation={2}>
          <Toolbar>
            <Box sx={{ width: 32, height: 32, bgcolor: '#23262f', borderRadius: 2, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUpIcon fontSize="medium" sx={{ color: '#fff' }} />
            </Box>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Speed Mode
            </Typography>
            <Typography variant="body2" color="inherit">
              {current + 1}/{scenarios.length}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="sm">
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 3 }}>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(timer / 5) * 100}
                  sx={{ height: 8, borderRadius: 4, mb: 1, bgcolor: '#23262f' }}
                  color={timer <= 2 ? 'error' : 'primary'}
                />
                <Typography align="center" sx={{ fontWeight: 700, fontSize: 18 }}>
                  {timer}s
                </Typography>
                <Typography align="center" color="text.secondary" sx={{ fontSize: 14 }}>
                  Pattern: {scenario.pattern}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <CandlestickChart data={scenario.candles} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                {(['buy', 'sell', 'skip'] as const).map(action => (
                  <Button
                    key={action}
                    variant="contained"
                    color={action === 'buy' ? 'success' : action === 'sell' ? 'error' : 'primary'}
                    size="large"
                    disabled={!!userAction}
                    sx={{ borderRadius: 99, minWidth: 100, fontWeight: 700, fontSize: 18 }}
                    onClick={() => handleAction(action)}
                  >
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </Button>
                ))}
              </Box>
              <Slide direction="up" in={!!feedback} mountOnEnter unmountOnExit>
                <Paper sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: feedback?.correct ? '#26a69a' : '#ef5350' }}>
                  <Typography align="center" sx={{ fontWeight: 700, fontSize: 20 }}>
                    {feedback?.correct ? 'Correct!' : 'Missed!'}
                  </Typography>
                  <Typography align="center" sx={{ fontSize: 16 }}>
                    {feedback?.correct
                      ? '+10 XP'
                      : `Answer: ${feedback?.answer.toUpperCase()}  (-5 XP)`}
                  </Typography>
                  <Typography align="center" sx={{ fontSize: 14, mt: 1 }}>
                    Streak: {streak}
                  </Typography>
                </Paper>
              </Slide>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  // Session Summary Screen
  if (screen === 'summary') {
    let accuracy, avgSpeed, xpVal, streakVal;
    if (mode === 1) {
      accuracy = Math.round((riskXP / (riskScenarios.length * 10)) * 100);
      avgSpeed =
        riskReactionTimes.length > 0
          ? (riskReactionTimes.reduce((a, b) => a + b, 0) / riskReactionTimes.length).toFixed(2)
          : '-';
      xpVal = riskXP;
      streakVal = riskStreak;
    } else if (mode === 2) {
      accuracy = Math.round((patternXP / (patternScenarios.length * 10)) * 100);
      avgSpeed =
        patternReactionTimes.length > 0
          ? (patternReactionTimes.reduce((a, b) => a + b, 0) / patternReactionTimes.length).toFixed(2)
          : '-';
      xpVal = patternXP;
      streakVal = patternStreak;
    } else {
      accuracy = Math.round((xp / (scenarios.length * 10)) * 100);
      avgSpeed =
        reactionTimes.length > 0
          ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(2)
          : '-';
      xpVal = xp;
      streakVal = streak;
    }
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AppBar position="static" color="primary" elevation={2}>
          <Toolbar>
            <Box sx={{ width: 32, height: 32, bgcolor: '#23262f', borderRadius: 2, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUpIcon fontSize="medium" sx={{ color: '#fff' }} />
            </Box>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Session Summary
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="xs">
            <Card sx={{ borderRadius: 4, boxShadow: 4, p: 2, mt: 6 }}>
              <CardContent>
                <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                  Well Done!
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 2 }}>
                  <Box textAlign="center" sx={{ flex: 1 }}>
                    <WhatshotIcon sx={{ color: '#26a69a', mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">Accuracy</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{accuracy}%</Typography>
                  </Box>
                  <Box textAlign="center" sx={{ flex: 1 }}>
                    <SpeedIcon sx={{ color: '#2962ff', mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">Avg. Speed</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{avgSpeed}s</Typography>
                  </Box>
                </Box>
                <Typography align="center" sx={{ mt: 3, fontSize: 18 }}>
                  XP Earned: {xpVal}
                </Typography>
                <Typography align="center" sx={{ mt: 1, fontSize: 16 }}>
                  Streak: {streakVal}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ borderRadius: 99, mt: 3, fontWeight: 700 }}
                  onClick={() => setScreen('home')}
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
            <Typography align="center" color="text.secondary" sx={{ mt: 4, fontSize: 13 }}>
              Powered by LucidTrading
            </Typography>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return null;
}