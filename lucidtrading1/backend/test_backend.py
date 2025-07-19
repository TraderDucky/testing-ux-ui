#!/usr/bin/env python3
"""
Test script for TradeReflex Desktop Backend
Downloads sample data and tests the chart_data endpoint
"""

import requests
import json
import time

def test_backend():
    base_url = "http://localhost:5000"
    
    print("🧪 Testing TradeReflex Desktop Backend...")
    
    # Test 1: Download sample data
    print("\n1. Downloading sample AAPL data...")
    try:
        response = requests.get(f"{base_url}/download_aapl_sample")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Downloaded {data['timeframes']} timeframes")
            for tf, rows in data['rows'].items():
                print(f"   - {tf}: {rows} candles")
        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Get chart data for AAPL
    print("\n2. Fetching chart data for AAPL...")
    try:
        response = requests.get(f"{base_url}/chart_data/AAPL")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Retrieved data for {len(data)} timeframes")
            for timeframe, tf_data in data.items():
                candles = tf_data.get('candles', [])
                sr_levels = tf_data.get('sr_levels', [])
                print(f"   - {timeframe}: {len(candles)} candles, {len(sr_levels)} SR levels")
        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Get chart data for TSLA
    print("\n3. Fetching chart data for TSLA...")
    try:
        response = requests.get(f"{base_url}/chart_data/TSLA")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Retrieved data for {len(data)} timeframes")
            for timeframe, tf_data in data.items():
                candles = tf_data.get('candles', [])
                sr_levels = tf_data.get('sr_levels', [])
                print(f"   - {timeframe}: {len(candles)} candles, {len(sr_levels)} SR levels")
        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🎉 Backend test completed!")

if __name__ == "__main__":
    test_backend() 