from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import random
import os
import yfinance as yf
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# In-memory data stores
accounts = {}  # {user: {symbol: {'balance': float, 'positions': int}}}
trades = {}    # {user: {symbol: [trade_dict, ...]}}
stock_data = {}  # {symbol: {timeframe: pd.DataFrame}}

# Technical indicators
def calculate_vwap(df):
    """Calculate Volume Weighted Average Price"""
    typical_price = (df['High'] + df['Low'] + df['Close']) / 3
    vwap = (typical_price * df['Volume']).cumsum() / df['Volume'].cumsum()
    return vwap

def calculate_ema(df, period=9):
    """Calculate Exponential Moving Average"""
    return df['Close'].ewm(span=period).mean()

def find_support_resistance(df, window=20):
    """Find local support and resistance levels"""
    highs = df['High'].rolling(window=window, center=True).max()
    lows = df['Low'].rolling(window=window, center=True).min()
    
    # Find swing highs and lows
    swing_highs = df[df['High'] == highs]['High'].dropna()
    swing_lows = df[df['Low'] == lows]['Low'].dropna()
    
    # Get recent levels (last 50 periods)
    recent_highs = swing_highs.tail(50).tolist()
    recent_lows = swing_lows.tail(50).tolist()
    
    # Round to nearest 0.5 for cleaner levels
    levels = []
    for level in recent_highs + recent_lows:
        rounded = round(level * 2) / 2
        if rounded not in levels:
            levels.append(rounded)
    
    return sorted(levels)[-10:]  # Return top 10 levels

def fetch_multi_timeframe_data(symbol, period='7d'):
    """Fetch data for multiple timeframes"""
    timeframes = {
        '1min': '1m',
        '1hour': '1h', 
        '1day': '1d'
    }
    
    data = {}
    for tf_name, tf_interval in timeframes.items():
        try:
            df = yf.download(symbol, period=period, interval=tf_interval)
            if not df.empty:
                df.reset_index(inplace=True)
                df['Volume'] = df['Volume'].fillna(0)
                
                # Calculate indicators
                df['VWAP'] = calculate_vwap(df)
                df['EMA9'] = calculate_ema(df, 9)
                
                # Find support/resistance for daily timeframe
                if tf_name == '1day':
                    df['SR_Levels'] = [find_support_resistance(df)] * len(df)
                
                data[tf_name] = df
        except Exception as e:
            print(f"Error fetching {tf_name} data for {symbol}: {e}")
    
    return data

# Enhanced data endpoints for desktop app
@app.route('/chart_data/<symbol>', methods=['GET'])
def get_chart_data(symbol):
    """Get multi-timeframe chart data with indicators"""
    try:
        data = fetch_multi_timeframe_data(symbol)
        
        response = {}
        for timeframe, df in data.items():
            candles = []
            for _, row in df.iterrows():
                # Convert Datetime to UNIX timestamp (seconds)
                dt = pd.to_datetime(row['Datetime'])
                unix = int(dt.timestamp())
                
                candle = {
                    'time': unix,
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': float(row['Volume'])
                }
                
                # Add indicators
                if not pd.isna(row['VWAP']):
                    candle['vwap'] = float(row['VWAP'])
                if not pd.isna(row['EMA9']):
                    candle['ema9'] = float(row['EMA9'])
                
                candles.append(candle)
            
            response[timeframe] = {
                'candles': candles,
                'sr_levels': find_support_resistance(df) if timeframe == '1day' else []
            }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download_aapl_sample', methods=['GET'])
def download_aapl_sample():
    try:
        data = fetch_multi_timeframe_data('AAPL')
        
        # Save to CSV files
        for timeframe, df in data.items():
            csv_path = os.path.join(os.path.dirname(__file__), f'AAPL_7d_{timeframe}.csv')
            df.to_csv(csv_path, index=False)
        
        return jsonify({
            'message': 'Downloaded multi-timeframe data',
            'timeframes': list(data.keys()),
            'rows': {tf: len(df) for tf, df in data.items()}
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve AAPL candles from the downloaded CSV (legacy endpoint)
@app.route('/aapl_candles', methods=['GET'])
def aapl_candles():
    csv_path = os.path.join(os.path.dirname(__file__), 'AAPL_7d_1min.csv')
    if not os.path.exists(csv_path):
        return jsonify({'error': 'CSV not found. Download it first.'}), 404
    df = pd.read_csv(csv_path)
    candles = []
    for _, row in df.iterrows():
        # Convert Datetime to UNIX timestamp (seconds)
        dt = pd.to_datetime(row['Datetime'])
        unix = int(dt.timestamp())
        candles.append({
            'time': unix,
            'open': float(row['Open']),
            'high': float(row['High']),
            'low': float(row['Low']),
            'close': float(row['Close']),
        })
    return jsonify(candles)

# Simulate some stock data for a few symbols (for trading sim endpoints)
SYMBOLS = ['AAPL', 'GOOG', 'TSLA']
def generate_stock_data(symbol):
    dates = pd.date_range('2024-01-01', periods=100)
    prices = [random.uniform(100, 500) for _ in range(100)]
    df = pd.DataFrame({'date': dates, 'price': prices})
    return df
for symbol in SYMBOLS:
    stock_data[symbol] = generate_stock_data(symbol)

@app.route('/start_replay', methods=['POST'])
def start_replay():
    data = request.json
    user = data.get('user')
    symbol = data.get('symbol')
    if not user or not symbol or symbol not in stock_data:
        return jsonify({'error': 'Invalid user or symbol'}), 400
    # Initialize account and trades for the user/symbol
    accounts.setdefault(user, {})[symbol] = {'balance': 10000.0, 'positions': 0}
    trades.setdefault(user, {})[symbol] = []
    return jsonify({'message': f'Replay started for {user} on {symbol}', 'balance': 10000.0, 'positions': 0})

@app.route('/place_order', methods=['POST'])
def place_order():
    data = request.json
    user = data.get('user')
    symbol = data.get('symbol')
    side = data.get('side')  # 'buy' or 'sell'
    qty = int(data.get('qty', 0))
    if not user or not symbol or symbol not in stock_data or side not in ['buy', 'sell'] or qty <= 0:
        return jsonify({'error': 'Invalid order data'}), 400
    # Get latest price
    price = stock_data[symbol]['price'].iloc[-1]
    # Ensure account exists
    if user not in accounts or symbol not in accounts[user]:
        return jsonify({'error': 'Replay not started for this user/symbol'}), 400
    account = accounts[user][symbol]
    # Simulate order
    if side == 'buy':
        cost = price * qty
        if account['balance'] < cost:
            return jsonify({'error': 'Insufficient balance'}), 400
        account['balance'] -= cost
        account['positions'] += qty
    else:  # sell
        if account['positions'] < qty:
            return jsonify({'error': 'Not enough positions to sell'}), 400
        account['balance'] += price * qty
        account['positions'] -= qty
    # Record trade
    trade = {'side': side, 'qty': qty, 'price': price, 'timestamp': pd.Timestamp.now().isoformat()}
    trades[user][symbol].append(trade)
    return jsonify({'message': 'Order placed', 'trade': trade, 'account': account})

@app.route('/account/<user>/<symbol>', methods=['GET'])
def get_account(user, symbol):
    if user not in accounts or symbol not in accounts[user]:
        return jsonify({'error': 'Account not found'}), 404
    return jsonify(accounts[user][symbol])

@app.route('/trades/<user>/<symbol>', methods=['GET'])
def get_trades(user, symbol):
    if user not in trades or symbol not in trades[user]:
        return jsonify([])
    return jsonify(trades[user][symbol])

if __name__ == '__main__':
    app.run(debug=True)