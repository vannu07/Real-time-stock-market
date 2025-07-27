// 🚀 MAIN JAVASCRIPT - Core Functionality

class StockDashboard {
    constructor() {
        this.currentStock = null;
        this.isLoading = false;
        this.charts = {};
        this.socket = null;
        this.voiceAssistant = null;
        this.dashboard3D = null;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Stock Dashboard...');
        
        // Initialize components
        this.initializeEventListeners();
        this.initializeWebSocket();
        this.initializeVoiceAssistant();
        this.initialize3DDashboard();
        this.loadInitialData();
        
        console.log('✅ Dashboard initialized successfully!');
    }
    
    initializeEventListeners() {
        // Stock card clicks
        document.querySelectorAll('.stock-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const symbol = card.dataset.symbol;
                this.selectStock(symbol);
            });
        });
        
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('stockSearch');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const symbol = searchInput.value.trim().toUpperCase();
                if (symbol) {
                    this.selectStock(symbol);
                }
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const symbol = searchInput.value.trim().toUpperCase();
                    if (symbol) {
                        this.selectStock(symbol);
                    }
                }
            });
        }
        
        // Control buttons
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (this.currentStock) {
                    this.loadStockData(this.currentStock);
                }
            });
        }
        
        // Time period buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const period = btn.dataset.period;
                if (this.currentStock) {
                    this.updateChart(this.currentStock, period);
                }
            });
        });
        
        // 3D Toggle
        const toggle3D = document.getElementById('toggle3D');
        if (toggle3D) {
            toggle3D.addEventListener('click', () => {
                this.toggle3DView();
            });
        }
    }
    
    initializeWebSocket() {
        try {
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('🔌 WebSocket connected');
                this.showNotification('Connected to real-time data feed', 'success');
            });
            
            this.socket.on('stock_update', (data) => {
                this.handleStockUpdate(data);
            });
            
            this.socket.on('sentiment_update', (data) => {
                this.handleSentimentUpdate(data);
            });
            
            this.socket.on('disconnect', () => {
                console.log('🔌 WebSocket disconnected');
                this.showNotification('Disconnected from data feed', 'warning');
            });
            
        } catch (error) {
            console.warn('WebSocket not available, using polling mode');
            this.initializePolling();
        }
    }
    
    initializePolling() {
        // Fallback to polling if WebSocket is not available
        setInterval(() => {
            if (this.currentStock) {
                this.loadStockData(this.currentStock, false);
            }
        }, 30000); // Update every 30 seconds
    }
    
    initializeVoiceAssistant() {
        if (typeof VoiceAssistant !== 'undefined') {
            this.voiceAssistant = new VoiceAssistant();
            console.log('🎤 Voice Assistant initialized');
        }
    }
    
    initialize3DDashboard() {
        // 3D Dashboard will be initialized by its own script
        setTimeout(() => {
            if (window.dashboard3D) {
                console.log('🌟 3D Dashboard connected');
            }
        }, 1000);
    }
    
    loadInitialData() {
        // Load default stock (Apple)
        this.selectStock('AAPL');
        
        // Update quick stats
        this.updateQuickStats();
    }
    
    async selectStock(symbol) {
        if (this.isLoading) return;
        
        console.log(`📊 Selecting stock: ${symbol}`);
        
        // Update UI
        this.updateStockSelection(symbol);
        this.currentStock = symbol;
        
        // Load data
        await this.loadStockData(symbol);
        
        // Show analysis section
        this.showAnalysisSection();
        
        // Update 3D dashboard if available
        if (window.dashboard3D) {
            window.dashboard3D.focusStock(symbol);
        }
    }
    
    updateStockSelection(symbol) {
        // Remove previous selection
        document.querySelectorAll('.stock-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to current stock
        const selectedCard = document.querySelector(`[data-symbol="${symbol}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Update header
        const currentStockHeader = document.getElementById('currentStock');
        if (currentStockHeader) {
            currentStockHeader.textContent = `${symbol} Analysis`;
        }
    }
    
    async loadStockData(symbol, showLoading = true) {
        if (showLoading) {
            this.showLoading(true);
        }
        
        try {
            // Load comprehensive analysis
            const response = await fetch(`/api/enhanced/comprehensive-analysis/${symbol}`);
            const data = await response.json();
            
            if (data.success) {
                this.updateDashboard(data.data);
                this.showNotification(`${symbol} data updated successfully`, 'success');
            } else {
                throw new Error(data.message || 'Failed to load data');
            }
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showNotification(`Failed to load ${symbol} data`, 'error');
            
            // Load demo data as fallback
            this.loadDemoData(symbol);
        } finally {
            if (showLoading) {
                this.showLoading(false);
            }
        }
    }
    
    updateDashboard(data) {
        // Update price chart
        this.updatePriceChart(data);
        
        // Update sentiment analysis
        this.updateSentimentAnalysis(data.social_sentiment);
        
        // Update trading signals
        this.updateTradingSignals(data.trading_analysis);
        
        // Update key metrics
        this.updateKeyMetrics(data.stock_data);
        
        // Update AI insights
        this.updateAIInsights(data.ai_insights);
        
        // Update 3D dashboard
        if (window.dashboard3D) {
            window.dashboard3D.updateStockData(data.symbol, data.stock_data);
        }
    }
    
    updatePriceChart(data) {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.priceChart) {
            this.charts.priceChart.destroy();
        }
        
        // Generate sample price data
        const prices = this.generatePriceData(data.stock_data?.current_price || 150);
        
        this.charts.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: prices.labels,
                datasets: [{
                    label: 'Price',
                    data: prices.values,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 6
                    }
                }
            }
        });
    }
    
    updateSentimentAnalysis(sentimentData) {
        if (!sentimentData) return;
        
        // Update sentiment score
        const scoreElement = document.getElementById('sentimentScore');
        if (scoreElement) {
            const score = sentimentData.combined_sentiment || 0;
            const label = sentimentData.sentiment_label || 'Neutral';
            
            scoreElement.querySelector('.score-value').textContent = score.toFixed(2);
            scoreElement.querySelector('.score-label').textContent = label;
        }
        
        // Update sentiment bars
        const sources = sentimentData.source_breakdown || {};
        Object.keys(sources).forEach(source => {
            const sourceData = sources[source];
            const sentiment = sourceData.sentiment || 0;
            const percentage = Math.abs(sentiment) * 100;
            
            const bar = document.querySelector(`[data-source="${source}"] .sentiment-fill`);
            if (bar) {
                bar.style.width = `${percentage}%`;
                bar.className = `sentiment-fill ${sentiment >= 0 ? 'positive' : 'negative'}`;
            }
            
            const value = document.querySelector(`[data-source="${source}"] .sentiment-value`);
            if (value) {
                value.textContent = sentiment.toFixed(2);
            }
        });
    }
    
    updateTradingSignals(tradingData) {
        if (!tradingData || !tradingData.decisions || tradingData.decisions.length === 0) return;
        
        const decision = tradingData.decisions[0];
        
        // Update signal display
        const signalItem = document.querySelector('.signal-item');
        if (signalItem) {
            const signal = decision.signal;
            const confidence = decision.confidence;
            const targetPrice = decision.target_price;
            
            // Update signal type
            signalItem.className = `signal-item ${signal.toLowerCase().includes('buy') ? 'buy' : 'sell'}`;
            
            // Update signal info
            const signalInfo = signalItem.querySelector('.signal-info');
            if (signalInfo) {
                signalInfo.querySelector('h4').textContent = `${signal} Signal`;
                signalInfo.querySelectorAll('p')[0].textContent = `Confidence: ${(confidence * 100).toFixed(0)}%`;
                signalInfo.querySelectorAll('p')[1].textContent = `Target: $${targetPrice.toFixed(2)}`;
            }
            
            // Update reasoning
            const reasoningList = document.querySelector('.signal-reasoning ul');
            if (reasoningList && decision.reasoning) {
                reasoningList.innerHTML = '';
                decision.reasoning.forEach(reason => {
                    const li = document.createElement('li');
                    li.textContent = reason;
                    reasoningList.appendChild(li);
                });
            }
        }
    }
    
    updateKeyMetrics(stockData) {
        if (!stockData) return;
        
        const metrics = {
            'Market Cap': this.formatMarketCap(stockData.market_cap || 2800000000000),
            'P/E Ratio': (stockData.pe_ratio || 28.5).toFixed(1),
            'Volume': this.formatVolume(stockData.volume || 45200000),
            '52W High': `$${(stockData.high_52w || 198.23).toFixed(2)}`,
            '52W Low': `$${(stockData.low_52w || 124.17).toFixed(2)}`,
            'Dividend': `$${(stockData.dividend || 0.96).toFixed(2)}`
        };
        
        document.querySelectorAll('.metric-item').forEach((item, index) => {
            const label = item.querySelector('.metric-label').textContent;
            const valueElement = item.querySelector('.metric-value');
            
            if (metrics[label]) {
                valueElement.textContent = metrics[label];
            }
        });
    }
    
    updateAIInsights(insights) {
        if (!insights) return;
        
        const insightsSection = document.getElementById('insightsSection');
        if (insightsSection) {
            insightsSection.style.display = 'block';
            
            // Update insight cards with AI-generated content
            const insightCards = insightsSection.querySelectorAll('.insight-card');
            
            if (insightCards.length >= 3) {
                // Market Opportunity
                const opportunityCard = insightCards[0];
                opportunityCard.querySelector('h3').textContent = 'Market Opportunity';
                opportunityCard.querySelector('p').textContent = insights.market_outlook || 
                    'AI detects strong bullish momentum with 94% confidence. Technical indicators suggest potential 8-12% upside in the next 2-3 weeks.';
                
                // Risk Assessment
                const riskCard = insightCards[1];
                riskCard.querySelector('h3').textContent = 'Risk Assessment';
                riskCard.querySelector('p').textContent = insights.risk_assessment || 
                    'Current risk level is moderate. Recommended position size: 5-8% of portfolio with stop-loss at $165.50.';
                
                // Investment Recommendation
                const recommendationCard = insightCards[2];
                recommendationCard.querySelector('h3').textContent = 'Investment Recommendation';
                recommendationCard.querySelector('p').textContent = insights.investment_recommendation || 
                    'Optimal entry window detected. Social sentiment and technical momentum align for favorable risk-reward ratio.';
            }
        }
    }
    
    updateQuickStats() {
        // Simulate real-time updates to quick stats
        const stats = {
            portfolioValue: 125430 + (Math.random() - 0.5) * 1000,
            aiAccuracy: 94.2 + (Math.random() - 0.5) * 2,
            activeSignals: Math.floor(Math.random() * 10) + 5,
            todayGain: 2847 + (Math.random() - 0.5) * 500
        };
        
        // Update portfolio value
        const portfolioElement = document.getElementById('portfolioValue');
        if (portfolioElement) {
            portfolioElement.textContent = `$${stats.portfolioValue.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        }
        
        // Update AI accuracy
        const accuracyElement = document.getElementById('aiAccuracy');
        if (accuracyElement) {
            accuracyElement.textContent = `${stats.aiAccuracy.toFixed(1)}%`;
        }
        
        // Update active signals
        const signalsElement = document.getElementById('activeSignals');
        if (signalsElement) {
            signalsElement.textContent = stats.activeSignals.toString();
        }
        
        // Update today's gain
        const gainElement = document.getElementById('todayGain');
        if (gainElement) {
            const gain = stats.todayGain;
            gainElement.textContent = `${gain >= 0 ? '+' : ''}$${gain.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        }
    }
    
    showAnalysisSection() {
        const analysisSection = document.getElementById('analysisSection');
        if (analysisSection) {
            analysisSection.style.display = 'block';
            
            // Smooth scroll to analysis
            analysisSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            if (show) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
        }
        
        this.isLoading = show;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 2000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#2563eb'
        };
        return colors[type] || '#2563eb';
    }
    
    toggle3DView() {
        if (window.dashboard3D) {
            window.dashboard3D.toggle3DView();
        } else {
            this.showNotification('3D Dashboard not available', 'warning');
        }
    }
    
    // Utility functions
    generatePriceData(currentPrice) {
        const labels = [];
        const values = [];
        const points = 24;
        
        for (let i = points - 1; i >= 0; i--) {
            const time = new Date();
            time.setHours(time.getHours() - i);
            labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            
            // Generate realistic price movement
            const variation = (Math.random() - 0.5) * currentPrice * 0.02;
            const price = currentPrice + variation;
            values.push(price);
        }
        
        return { labels, values };
    }
    
    formatMarketCap(value) {
        if (value >= 1e12) {
            return `$${(value / 1e12).toFixed(1)}T`;
        } else if (value >= 1e9) {
            return `$${(value / 1e9).toFixed(1)}B`;
        } else if (value >= 1e6) {
            return `$${(value / 1e6).toFixed(1)}M`;
        }
        return `$${value.toLocaleString()}`;
    }
    
    formatVolume(value) {
        if (value >= 1e6) {
            return `${(value / 1e6).toFixed(1)}M`;
        } else if (value >= 1e3) {
            return `${(value / 1e3).toFixed(1)}K`;
        }
        return value.toLocaleString();
    }
    
    loadDemoData(symbol) {
        // Fallback demo data
        const demoData = {
            symbol: symbol,
            stock_data: {
                current_price: 150 + Math.random() * 50,
                volume: 45000000,
                market_cap: 2800000000000,
                pe_ratio: 28.5,
                high_52w: 198.23,
                low_52w: 124.17,
                dividend: 0.96
            },
            social_sentiment: {
                combined_sentiment: (Math.random() - 0.5) * 1.5,
                sentiment_label: Math.random() > 0.5 ? 'Bullish' : 'Bearish',
                source_breakdown: {
                    twitter: { sentiment: Math.random() - 0.5 },
                    reddit: { sentiment: Math.random() - 0.5 },
                    news: { sentiment: Math.random() - 0.5 }
                }
            },
            trading_analysis: {
                decisions: [{
                    signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
                    confidence: 0.7 + Math.random() * 0.3,
                    target_price: 150 + Math.random() * 30,
                    reasoning: [
                        'Strong technical momentum detected',
                        'Positive sentiment across social platforms',
                        'Volume confirms price movement',
                        'AI model shows high confidence'
                    ]
                }]
            },
            ai_insights: {
                market_outlook: 'AI detects strong bullish momentum with high confidence.',
                risk_assessment: 'Current risk level is moderate with favorable risk-reward ratio.',
                investment_recommendation: 'Optimal entry window detected based on technical and sentiment analysis.'
            }
        };
        
        this.updateDashboard(demoData);
        this.showNotification(`Loaded demo data for ${symbol}`, 'info');
    }
    
    handleStockUpdate(data) {
        if (data.symbol === this.currentStock) {
            this.updateDashboard(data);
        }
    }
    
    handleSentimentUpdate(data) {
        if (data.symbol === this.currentStock) {
            this.updateSentimentAnalysis(data);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new StockDashboard();
    
    // Update quick stats every 30 seconds
    setInterval(() => {
        window.dashboard.updateQuickStats();
    }, 30000);
});

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockDashboard;
}