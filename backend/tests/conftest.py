import pytest
import os
import sys
import tempfile
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db_manager, user_manager, stock_collector, sentiment_collector
from auth.user_manager import UserManager
from utils.database_manager import DatabaseManager

@pytest.fixture
def client():
    """Create a test client for the Flask application"""
    # Create a temporary database for testing
    db_fd, app.config['DATABASE'] = tempfile.mkstemp()
    app.config['TESTING'] = True
    
    with app.test_client() as client:
        with app.app_context():
            # Initialize test database
            pass
        yield client
    
    os.close(db_fd)
    os.unlink(app.config['DATABASE'])

@pytest.fixture
def test_user():
    """Create a test user"""
    return {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpassword123',
        'full_name': 'Test User'
    }

@pytest.fixture
def authenticated_user(client, test_user):
    """Create and authenticate a test user"""
    # Register user
    response = client.post('/api/auth/register', json=test_user)
    assert response.status_code == 201
    
    # Login user
    login_data = {
        'username': test_user['username'],
        'password': test_user['password']
    }
    response = client.post('/api/auth/login', json=login_data)
    assert response.status_code == 200
    
    data = response.get_json()
    return {
        'token': data['token'],
        'user': data['user']
    }

@pytest.fixture
def auth_headers(authenticated_user):
    """Get authentication headers for requests"""
    return {
        'Authorization': f"Bearer {authenticated_user['token']}",
        'Content-Type': 'application/json'
    }

@pytest.fixture
def sample_stock_data():
    """Sample stock data for testing"""
    return {
        'symbol': 'AAPL',
        'current_price': 150.50,
        'change_percent': 2.5,
        'volume': 1000000,
        'market_cap': 2500000000,
        'pe_ratio': 25.5
    }

@pytest.fixture
def sample_sentiment_data():
    """Sample sentiment data for testing"""
    return {
        'symbol': 'AAPL',
        'compound_score': 0.25,
        'positive_score': 0.6,
        'negative_score': 0.1,
        'neutral_score': 0.3,
        'sentiment_label': 'positive',
        'news_count': 5
    }

@pytest.fixture
def mock_database_manager():
    """Mock database manager for testing"""
    class MockDatabaseManager:
        def __init__(self):
            self.portfolios = []
            self.stock_data = []
        
        def get_portfolio(self):
            return self.portfolios
        
        def update_portfolio(self, symbol, quantity, action):
            return {'success': True, 'message': f'Portfolio updated for {symbol}'}
        
        def initialize_database(self):
            pass
    
    return MockDatabaseManager()

@pytest.fixture
def mock_stock_collector():
    """Mock stock collector for testing"""
    class MockStockCollector:
        def get_current_data(self, symbol):
            return {
                'symbol': symbol,
                'current_price': 150.0,
                'change_percent': 2.5,
                'volume': 1000000,
                'timestamp': datetime.now()
            }
        
        def get_historical_data(self, symbol, days=30):
            return [
                {'date': '2023-01-01', 'close': 150.0, 'volume': 1000000}
                for _ in range(days)
            ]
        
        def test_connection(self):
            return {'yahoo_finance': True, 'alpha_vantage': False}
    
    return MockStockCollector()

@pytest.fixture
def mock_sentiment_collector():
    """Mock sentiment collector for testing"""
    class MockSentimentCollector:
        def get_sentiment_for_stock(self, symbol):
            return {
                'symbol': symbol,
                'compound_score': 0.25,
                'positive_score': 0.6,
                'negative_score': 0.1,
                'neutral_score': 0.3,
                'sentiment_label': 'positive'
            }
        
        def get_detailed_sentiment(self, symbol):
            return {
                'current_sentiment': self.get_sentiment_for_stock(symbol),
                'historical_sentiment': [],
                'sentiment_trend': 'stable'
            }
    
    return MockSentimentCollector()
