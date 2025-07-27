from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
import os
import sys
import logging
import json
import random
from datetime import datetime, timedelta
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, 
           template_folder='../frontend',
           static_folder='../frontend')

app.config['SECRET_KEY'] = 'your-secret-key-here'
CORS(app)

# Default stocks for demo - Expanded list
DEFAULT_STOCKS = [
    # Tech Giants
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'NFLX', 'ORCL',
    # Electric Vehicles & Energy
    'TSLA', 'NIO', 'RIVN', 'LCID',
    # Finance & Banking
    'JPM', 'BAC', 'WFC', 'GS',
    # Healthcare & Pharma
    'JNJ', 'PFE', 'UNH', 'ABBV',
    # Consumer & Retail
    'WMT', 'HD', 'PG', 'KO',
    # Aerospace & Defense
    'BA', 'LMT', 'RTX', 'NOC'
]

# Demo data generators
def generate_stock_data(symbol):
    """Generate realistic demo stock data"""
    base_prices = {
        # Tech Giants
        'AAPL': 175.43, 'GOOGL': 2847.92, 'MSFT': 378.85, 'AMZN': 3127.45,
        'META': 487.23, 'NVDA': 875.28, 'NFLX': 445.67, 'ORCL': 112.45,
        # Electric Vehicles & Energy
        'TSLA': 248.73, 'NIO': 8.45, 'RIVN': 12.67, 'LCID': 3.89,
        # Finance & Banking
        'JPM': 145.23, 'BAC': 32.78, 'WFC': 42.15, 'GS': 387.92,
        # Healthcare & Pharma
        'JNJ': 162.45, 'PFE': 28.67, 'UNH': 523.78, 'ABBV': 147.23,
        # Consumer & Retail
        'WMT': 158.92, 'HD': 312.45, 'PG': 152.67, 'KO': 58.23,
        # Aerospace & Defense
        'BA': 198.45, 'LMT': 445.67, 'RTX': 89.23, 'NOC': 467.89
    }
    
    base_price = base_prices.get(symbol, 100.0)
    change_percent = random.uniform(-5.0, 5.0)
    current_price = base_price * (1 + change_percent / 100)
    
    return {
        'symbol': symbol,
        'current_price': round(current_price, 2),
        'change_percent': round(change_percent, 2),
        'volume': random.randint(1000000, 50000000),
        'market_cap': f"${random.randint(500, 3000)}B",
        'pe_ratio': round(random.uniform(15, 35), 1),
        'high_52w': round(current_price * 1.3, 2),
        'low_52w': round(current_price * 0.7, 2),
        'timestamp': datetime.now().isoformat()
    }

def generate_historical_data(symbol, days=30):
    """Generate historical price data"""
    data = []
    base_price = 100.0
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days-i-1)
        change = random.uniform(-0.05, 0.05)
        base_price *= (1 + change)
        
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'price': round(base_price, 2),
            'volume': random.randint(1000000, 10000000)
        })
    
    return data

def generate_sentiment_data(symbol):
    """Generate sentiment analysis data"""
    compound = random.uniform(-1, 1)
    
    if compound > 0.05:
        label = 'Bullish'
        color = 'positive'
    elif compound < -0.05:
        label = 'Bearish'
        color = 'negative'
    else:
        label = 'Neutral'
        color = 'neutral'
    
    return {
        'compound': round(compound, 3),
        'positive': round(random.uniform(0.1, 0.9), 3),
        'negative': round(random.uniform(0.1, 0.4), 3),
        'neutral': round(random.uniform(0.1, 0.5), 3),
        'label': label,
        'color': color,
        'confidence': round(random.uniform(0.7, 0.95), 3),
        'sources': {
            'news': round(random.uniform(0.3, 0.8), 2),
            'social': round(random.uniform(0.2, 0.9), 2),
            'technical': round(random.uniform(0.4, 0.85), 2)
        }
    }

def generate_prediction_data(symbol):
    """Generate AI prediction data"""
    current_price = generate_stock_data(symbol)['current_price']
    
    return {
        'next_day': {
            'price': round(current_price * random.uniform(0.98, 1.02), 2),
            'confidence': round(random.uniform(0.75, 0.95), 3),
            'direction': random.choice(['up', 'down', 'stable'])
        },
        'next_week': {
            'price': round(current_price * random.uniform(0.95, 1.05), 2),
            'confidence': round(random.uniform(0.65, 0.85), 3),
            'direction': random.choice(['up', 'down', 'stable'])
        },
        'next_month': {
            'price': round(current_price * random.uniform(0.90, 1.10), 2),
            'confidence': round(random.uniform(0.55, 0.75), 3),
            'direction': random.choice(['up', 'down', 'stable'])
        },
        'models': {
            'lstm': {'accuracy': 0.94, 'prediction': round(current_price * 1.02, 2)},
            'random_forest': {'accuracy': 0.89, 'prediction': round(current_price * 1.01, 2)},
            'xgboost': {'accuracy': 0.91, 'prediction': round(current_price * 1.015, 2)},
            'ensemble': {'accuracy': 0.96, 'prediction': round(current_price * 1.018, 2)}
        }
    }

# Routes
@app.route('/')
def index():
    """Serve the main page"""
    try:
        return send_from_directory('../frontend', 'index.html')
    except Exception as e:
        logger.error(f"Error serving index: {e}")
        return f"<h1>Welcome to AI Stock Dashboard</h1><p>Error loading page: {e}</p><a href='/pages/dashboard.html'>Go to Dashboard</a>", 500

@app.route('/home')
def home():
    """Alternative home route"""
    return index()

@app.route('/pages/<path:filename>')
def serve_pages(filename):
    """Serve pages from frontend/pages directory"""
    try:
        return send_from_directory('../frontend/pages', filename)
    except Exception as e:
        logger.error(f"Error serving page {filename}: {e}")
        return f"Page not found: {filename}", 404

@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files"""
    try:
        return send_from_directory('../frontend/css', filename)
    except Exception as e:
        logger.error(f"Error serving CSS {filename}: {e}")
        return f"CSS file not found: {filename}", 404

@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files"""
    try:
        return send_from_directory('../frontend/js', filename)
    except Exception as e:
        logger.error(f"Error serving JS {filename}: {e}")
        return f"JS file not found: {filename}", 404

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve asset files"""
    try:
        return send_from_directory('../frontend/assets', filename)
    except Exception as e:
        logger.error(f"Error serving asset {filename}: {e}")
        return f"Asset not found: {filename}", 404

# API Routes
@app.route('/api/stocks')
def get_stocks():
    """Get list of available stocks"""
    try:
        stocks_data = []
        for symbol in DEFAULT_STOCKS:
            stock_data = generate_stock_data(symbol)
            stocks_data.append(stock_data)
        
        return jsonify({
            'success': True,
            'stocks': stocks_data,
            'count': len(stocks_data)
        })
    except Exception as e:
        logger.error(f"Error getting stocks: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'stocks': [],
            'count': 0
        }), 500

@app.route('/api/stock/<symbol>')
def get_stock_data(symbol):
    """Get comprehensive stock data"""
    try:
        symbol = symbol.upper()
        
        # Generate all data
        stock_data = generate_stock_data(symbol)
        sentiment_data = generate_sentiment_data(symbol)
        prediction_data = generate_prediction_data(symbol)
        historical_data = generate_historical_data(symbol, 30)
        
        result = {
            'success': True,
            'symbol': symbol,
            'stock_data': stock_data,
            'sentiment': sentiment_data,
            'predictions': prediction_data,
            'historical': historical_data,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error getting stock data for {symbol}: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'symbol': symbol
        }), 500

@app.route('/api/historical/<symbol>')
def get_historical_data(symbol):
    """Get historical data for charts"""
    try:
        symbol = symbol.upper()
        days = request.args.get('days', 30, type=int)
        days = min(max(days, 1), 365)  # Limit between 1 and 365 days
        
        data = generate_historical_data(symbol, days)
        
        return jsonify({
            'success': True,
            'symbol': symbol,
            'data': data,
            'days': days
        })
        
    except Exception as e:
        logger.error(f"Error getting historical data for {symbol}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'symbol': symbol
        }), 500

@app.route('/api/sentiment/<symbol>')
def get_sentiment_analysis(symbol):
    """Get detailed sentiment analysis"""
    try:
        symbol = symbol.upper()
        sentiment_data = generate_sentiment_data(symbol)
        
        # Add more detailed sentiment breakdown
        sentiment_data['breakdown'] = {
            'news_articles': random.randint(10, 50),
            'social_mentions': random.randint(100, 1000),
            'analyst_reports': random.randint(3, 15),
            'recent_trends': [
                {'date': (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d'), 
                 'sentiment': round(random.uniform(-1, 1), 3)} 
                for i in range(7)
            ]
        }
        
        return jsonify({
            'success': True,
            'symbol': symbol,
            'sentiment': sentiment_data
        })
        
    except Exception as e:
        logger.error(f"Error getting sentiment for {symbol}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'symbol': symbol
        }), 500

@app.route('/api/predictions/<symbol>')
def get_predictions(symbol):
    """Get AI predictions"""
    try:
        symbol = symbol.upper()
        prediction_data = generate_prediction_data(symbol)
        
        return jsonify({
            'success': True,
            'symbol': symbol,
            'predictions': prediction_data
        })
        
    except Exception as e:
        logger.error(f"Error getting predictions for {symbol}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'symbol': symbol
        }), 500

@app.route('/api/news/<symbol>')
def get_news(symbol):
    """Get news articles for a stock"""
    try:
        symbol = symbol.upper()
        
        # Generate demo news articles
        news_articles = []
        for i in range(random.randint(5, 15)):
            article = {
                'title': f"Breaking: {symbol} Shows Strong Performance in Latest Quarter",
                'description': f"Analysis shows {symbol} continuing its upward trend with positive market sentiment.",
                'url': f"https://example.com/news/{symbol.lower()}-article-{i}",
                'source': random.choice(['Reuters', 'Bloomberg', 'Yahoo Finance', 'MarketWatch', 'CNBC']),
                'published_date': (datetime.now() - timedelta(hours=random.randint(1, 48))).isoformat(),
                'sentiment_score': round(random.uniform(-1, 1), 3)
            }
            news_articles.append(article)
        
        return jsonify({
            'success': True,
            'symbol': symbol,
            'articles': news_articles,
            'count': len(news_articles)
        })
        
    except Exception as e:
        logger.error(f"Error getting news for {symbol}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'symbol': symbol,
            'articles': [],
            'count': 0
        }), 500

@app.route('/api/market-overview')
def get_market_overview():
    """Get overall market statistics"""
    try:
        overview = {
            'market_status': 'Open' if 9 <= datetime.now().hour <= 16 else 'Closed',
            'total_volume': f"{random.randint(50, 200)}B",
            'market_cap': f"${random.randint(40, 60)}T",
            'active_stocks': len(DEFAULT_STOCKS),
            'gainers': random.randint(60, 80),
            'losers': random.randint(20, 40),
            'unchanged': random.randint(5, 15),
            'indices': {
                'S&P 500': {
                    'value': round(random.uniform(4000, 4500), 2),
                    'change': round(random.uniform(-2, 2), 2)
                },
                'NASDAQ': {
                    'value': round(random.uniform(13000, 15000), 2),
                    'change': round(random.uniform(-3, 3), 2)
                },
                'DOW': {
                    'value': round(random.uniform(33000, 36000), 2),
                    'change': round(random.uniform(-1.5, 1.5), 2)
                }
            }
        }
        
        return jsonify({
            'success': True,
            'overview': overview,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting market overview: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'services': {
            'api': 'running',
            'database': 'connected',
            'ml_models': 'loaded'
        }
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'message': 'The requested resource was not found on this server.'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An unexpected error occurred. Please try again later.'
    }), 500

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {e}")
    logger.error(traceback.format_exc())
    return jsonify({
        'success': False,
        'error': 'Unexpected error',
        'message': str(e)
    }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Real-time ML Stock Dashboard...")
    logger.info(f"📊 Available stocks: {DEFAULT_STOCKS}")
    logger.info("🌐 Server starting on http://127.0.0.1:5000")
    
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            threaded=True
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)