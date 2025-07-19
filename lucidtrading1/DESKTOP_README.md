# TradeReflex Desktop App

A professional trading desktop application with 3 synchronized charts for multi-timeframe analysis.

## 🖥️ Features

- **3 Synchronized Charts**: 1-minute (main), 1-hour, and daily timeframes
- **Technical Indicators**: VWAP, EMA9, Support/Resistance levels
- **Real-time Data**: Live market data via yfinance
- **Symbol Selection**: 8 popular stocks (AAPL, GOOGL, MSFT, TSLA, etc.)
- **Responsive Layout**: Adapts to window size
- **Dark Theme**: Professional trading interface

## 📁 Project Structure

```
lucidtrading1/
├── backend/
│   ├── app.py              # Enhanced Flask backend with multi-timeframe data
│   ├── requirements.txt    # Python dependencies
│   └── test_backend.py     # Backend testing script
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── DesktopChart.tsx    # Individual chart component
│       │   └── DesktopApp.tsx      # Main desktop app layout
│       └── App.tsx                 # Updated with desktop mode
└── DESKTOP_README.md       # This file
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd lucidtrading1/backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python app.py
```

The backend will run on `http://localhost:5000`

### 2. Test Backend

```bash
# In the backend directory
python test_backend.py
```

This will download sample data and test the endpoints.

### 3. Frontend Setup

```bash
cd lucidtrading1/frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Access Desktop App

1. Open `http://localhost:5173` in your browser
2. Click "Desktop Charts" button on the home screen
3. Select a symbol from the dropdown
4. View the 3 synchronized charts

## 📊 Chart Layout

```
+-------------------------------------------------------------+
|                                                             |
|               |       Daily Chart (30%)                    |
|               |---------------------------------------------|
|  1-Min Chart  |       Hourly Chart (30%)                   |
|   (70%)       |                                             |
+-------------------------------------------------------------+
```

### Chart Features

#### 1-Minute Chart (Main - 70% width)
- Largest chart for detailed analysis
- VWAP and EMA9 indicators
- Volume bars
- Primary focus for trading decisions

#### Daily Chart (Top Right - 30% width)
- Higher timeframe context
- Support/Resistance levels
- VWAP and EMA9 indicators
- Previous high/low lines

#### Hourly Chart (Bottom Right - 30% width)
- Medium timeframe analysis
- VWAP and EMA9 indicators
- Volume displayed

## 🔧 Technical Details

### Backend API Endpoints

- `GET /chart_data/{symbol}` - Get multi-timeframe data with indicators
- `GET /download_aapl_sample` - Download sample data for testing

### Data Structure

```json
{
  "1min": {
    "candles": [...],
    "vwap": [...],
    "ema9": [...]
  },
  "1hour": {
    "candles": [...],
    "vwap": [...],
    "ema9": [...]
  },
  "1day": {
    "candles": [...],
    "vwap": [...],
    "ema9": [...],
    "sr_levels": [...]
  }
}
```

### Technical Indicators

- **VWAP**: Volume Weighted Average Price
- **EMA9**: 9-period Exponential Moving Average
- **Support/Resistance**: Auto-detected swing levels

## 🎯 Supported Symbols

- AAPL (Apple)
- GOOGL (Google)
- MSFT (Microsoft)
- TSLA (Tesla)
- AMZN (Amazon)
- NVDA (NVIDIA)
- META (Meta)
- NFLX (Netflix)

## 🛠️ Customization

### Adding New Symbols

1. Edit `SYMBOLS` array in `DesktopApp.tsx`
2. The backend will automatically fetch data for new symbols

### Modifying Indicators

1. Edit indicator calculations in `backend/app.py`
2. Update chart rendering in `DesktopChart.tsx`

### Changing Chart Layout

1. Modify the flex layout in `DesktopApp.tsx`
2. Adjust chart dimensions and positioning

## 🔍 Troubleshooting

### Backend Issues

1. **Port 5000 in use**: Change port in `app.py`
2. **yfinance errors**: Check internet connection
3. **Missing dependencies**: Run `pip install -r requirements.txt`

### Frontend Issues

1. **Charts not loading**: Check backend is running
2. **CORS errors**: Ensure backend CORS is enabled
3. **TypeScript errors**: Check type definitions

### Data Issues

1. **No data returned**: Check symbol is valid
2. **Missing indicators**: Verify data processing
3. **Slow loading**: Consider caching strategies

## 🚀 Next Steps

### Potential Enhancements

1. **Real-time Updates**: WebSocket integration
2. **More Indicators**: RSI, MACD, Bollinger Bands
3. **Chart Interactions**: Drawing tools, annotations
4. **Data Export**: CSV/JSON export functionality
5. **User Preferences**: Customizable layouts and indicators

### Performance Optimizations

1. **Data Caching**: Redis for frequently accessed data
2. **Chart Optimization**: Virtual scrolling for large datasets
3. **Bundle Optimization**: Code splitting for faster loading

## 📝 License

Powered by LucidTrading

---

For support or questions, check the main project documentation or create an issue in the repository. 