// 🧠 ANALYTICS PAGE FUNCTIONALITY

class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.updateInterval = null;
        this.isRealTimeEnabled = true;
        
        this.init();
    }
    
    init() {
        console.log('🧠 Initializing Analytics Manager...');
        
        this.initializeCharts();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.loadInitialData();
        
        console.log('✅ Analytics Manager initialized!');
    }
    
    initializeCharts() {
        this.initializeAccuracyChart();
        this.initializeSentimentGauge();
    }
    
    initializeAccuracyChart() {
        const ctx = document.getElementById('accuracyChart');
        if (!ctx) return;
        
        const data = this.generateAccuracyData();
        
        this.charts.accuracyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Price Predictor',
                        data: data.pricePredictor,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Sentiment Analyzer',
                        data: data.sentimentAnalyzer,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Trading Bot',
                        data: data.tradingBot,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
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
                        min: 80,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 8
                    }
                }
            }
        });
    }
    
    initializeSentimentGauge() {
        // Sentiment gauge is handled by CSS animations
        this.updateSentimentGauge(0.73);
    }
    
    setupEventListeners() {
        // Model selector
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                this.filterAccuracyChart(e.target.value);
            });
        }
        
        // Time frame controls
        document.querySelectorAll('[data-timeframe]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from siblings
                e.target.parentNode.querySelectorAll('.control-btn').forEach(b => {
                    b.classList.remove('active');
                });
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update data based on timeframe
                const timeframe = e.target.dataset.timeframe;
                this.updateSentimentData(timeframe);
            });
        });
        
        // Insight actions
        document.querySelectorAll('.insight-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.textContent.trim();
                const insightCard = btn.closest('.insight-card');
                
                if (action === 'View Details') {
                    this.showInsightDetails(insightCard);
                } else if (action === 'Dismiss') {
                    this.dismissInsight(insightCard);
                }
            });
        });
        
        // Real-time toggle
        this.createRealTimeToggle();
    }
    
    createRealTimeToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'control-btn realtime-toggle';
        toggle.innerHTML = `
            <i class="fas fa-broadcast-tower"></i>
            <span>Real-time: ON</span>
        `;
        
        // Add to page header
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            const toggleContainer = document.createElement('div');
            toggleContainer.style.marginTop = '1rem';
            toggleContainer.appendChild(toggle);
            headerContent.appendChild(toggleContainer);
        }
        
        toggle.addEventListener('click', () => {
            this.toggleRealTime();
            const span = toggle.querySelector('span');
            const icon = toggle.querySelector('i');
            
            if (this.isRealTimeEnabled) {
                span.textContent = 'Real-time: ON';
                icon.style.color = '#10b981';
            } else {
                span.textContent = 'Real-time: OFF';
                icon.style.color = '#6b7280';
            }
        });
    }
    
    startRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.isRealTimeEnabled) {
            this.updateInterval = setInterval(() => {
                this.updateRealTimeData();
            }, 5000); // Update every 5 seconds
        }
    }
    
    toggleRealTime() {
        this.isRealTimeEnabled = !this.isRealTimeEnabled;
        this.startRealTimeUpdates();
        
        if (this.isRealTimeEnabled) {
            this.showNotification('Real-time updates enabled', 'success');
        } else {
            this.showNotification('Real-time updates disabled', 'info');
        }
    }
    
    loadInitialData() {
        // Load AI model statuses
        this.updateModelStatuses();
        
        // Load predictions
        this.updatePredictions();
        
        // Load pattern recognition
        this.updatePatterns();
        
        // Load performance metrics
        this.updatePerformanceMetrics();
    }
    
    updateRealTimeData() {
        console.log('🔄 Updating real-time analytics data...');
        
        // Update model metrics with slight variations
        this.updateModelMetrics();
        
        // Update sentiment gauge
        const newSentiment = 0.73 + (Math.random() - 0.5) * 0.2;
        this.updateSentimentGauge(Math.max(0, Math.min(1, newSentiment)));
        
        // Update predictions
        this.updatePredictions();
        
        // Update performance metrics
        this.updatePerformanceMetrics();
        
        // Add new data point to accuracy chart
        this.addAccuracyDataPoint();
    }
    
    updateModelStatuses() {
        const models = document.querySelectorAll('.model-card');
        
        models.forEach((model, index) => {
            const metrics = model.querySelectorAll('.metric-value');
            
            // Simulate real-time metric updates
            if (metrics[0]) { // Accuracy
                const baseAccuracy = [96.3, 92.8, 78.4][index];
                const variation = (Math.random() - 0.5) * 2;
                const newAccuracy = Math.max(85, Math.min(99, baseAccuracy + variation));
                metrics[0].textContent = `${newAccuracy.toFixed(1)}%`;
            }
            
            if (metrics[1]) { // Confidence/Sources/Win Rate
                const baseValue = [89.7, 5, 12][index];
                const variation = Math.random() * 2;
                
                if (index === 0) { // Price Predictor - Confidence
                    metrics[1].textContent = `${(baseValue + variation).toFixed(1)}%`;
                } else if (index === 1) { // Sentiment Analyzer - Sources
                    metrics[1].textContent = `${Math.floor(baseValue + variation)} Active`;
                } else { // Trading Bot - Signals
                    metrics[1].textContent = `${Math.floor(baseValue + variation)} Today`;
                }
            }
            
            if (metrics[2]) { // Last Update
                const timeAgo = Math.floor(Math.random() * 5) + 1;
                metrics[2].textContent = `${timeAgo} min ago`;
            }
        });
    }
    
    updateModelMetrics() {
        // Update header stats
        const headerStats = document.querySelectorAll('.stat-value');
        
        if (headerStats[0]) { // AI Accuracy
            const accuracy = 94.7 + (Math.random() - 0.5) * 1;
            headerStats[0].textContent = `${accuracy.toFixed(1)}%`;
        }
        
        if (headerStats[1]) { // Data Points
            const dataPoints = 1.2 + Math.random() * 0.1;
            headerStats[1].textContent = `${dataPoints.toFixed(1)}M+`;
        }
    }
    
    updateSentimentGauge(value) {
        const gaugeFill = document.querySelector('.gauge-fill');
        const gaugeValue = document.querySelector('.gauge-value');
        const gaugeLabel = document.querySelector('.gauge-label');
        
        if (gaugeFill && gaugeValue && gaugeLabel) {
            // Update gauge rotation (0 to 180 degrees)
            const rotation = value * 180;
            gaugeFill.style.transform = `rotate(${rotation}deg)`;
            
            // Update value
            gaugeValue.textContent = value.toFixed(2);
            
            // Update label
            if (value > 0.6) {
                gaugeLabel.textContent = 'Bullish';
                gaugeLabel.style.color = '#10b981';
            } else if (value < 0.4) {
                gaugeLabel.textContent = 'Bearish';
                gaugeLabel.style.color = '#ef4444';
            } else {
                gaugeLabel.textContent = 'Neutral';
                gaugeLabel.style.color = '#6b7280';
            }
        }
        
        // Update sentiment breakdown
        this.updateSentimentBreakdown();
    }
    
    updateSentimentBreakdown() {
        const sentimentItems = document.querySelectorAll('.sentiment-item');
        
        sentimentItems.forEach((item, index) => {
            const progress = item.querySelector('.sentiment-progress');
            const score = item.querySelector('.sentiment-score');
            
            if (progress && score) {
                const value = 0.5 + (Math.random() - 0.5) * 0.6;
                const percentage = Math.abs(value) * 100;
                
                progress.style.width = `${percentage}%`;
                score.textContent = value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
                
                // Update color based on sentiment
                if (value >= 0) {
                    progress.style.background = 'linear-gradient(90deg, #10b981, #059669)';
                    score.style.color = '#10b981';
                } else {
                    progress.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
                    score.style.color = '#ef4444';
                }
            }
        });
    }
    
    updatePredictions() {
        const predictions = document.querySelectorAll('.prediction-item');
        
        predictions.forEach((prediction, index) => {
            const content = prediction.querySelector('.prediction-content p');
            const confidence = prediction.querySelector('.prediction-confidence span');
            
            if (content && confidence) {
                // Generate new prediction values
                const symbols = ['AAPL', 'TSLA', 'MSFT'];
                const currentPrices = [175.43, 248.73, 378.85];
                const changes = [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 8];
                const confidences = [87, 73, 91];
                
                const newPrice = currentPrices[index] + changes[index];
                const changePercent = (changes[index] / currentPrices[index]) * 100;
                const newConfidence = confidences[index] + (Math.random() - 0.5) * 10;
                
                // Update content
                const sign = changePercent >= 0 ? '+' : '';
                content.textContent = `$${newPrice.toFixed(2)} (${sign}${changePercent.toFixed(1)}%) in next 5 days`;
                confidence.textContent = `Confidence: ${Math.max(60, Math.min(95, newConfidence)).toFixed(0)}%`;
            }
        });
    }
    
    updatePatterns() {
        const patterns = document.querySelectorAll('.pattern-item');
        
        patterns.forEach(pattern => {
            const probability = pattern.querySelector('.pattern-probability');
            
            if (probability) {
                const currentProb = parseInt(probability.textContent);
                const variation = (Math.random() - 0.5) * 10;
                const newProb = Math.max(60, Math.min(95, currentProb + variation));
                
                probability.textContent = `${newProb.toFixed(0)}%`;
            }
        });
    }
    
    updatePerformanceMetrics() {
        const metricCards = document.querySelectorAll('.metric-card');
        
        metricCards.forEach((card, index) => {
            const value = card.querySelector('.metric-value');
            const change = card.querySelector('.metric-change');
            
            if (value && change) {
                const baseValues = [94.7, 0.23, 99.1, 99.9];
                const variations = [1, 0.05, 0.2, 0.1];
                const units = ['%', 's', '%', '%'];
                
                const newValue = baseValues[index] + (Math.random() - 0.5) * variations[index];
                const changeValue = (Math.random() - 0.5) * variations[index];
                
                // Update value
                if (index === 1) { // Processing speed
                    value.textContent = `${newValue.toFixed(2)}${units[index]}`;
                } else {
                    value.textContent = `${newValue.toFixed(1)}${units[index]}`;
                }
                
                // Update change
                const sign = changeValue >= 0 ? '+' : '';
                if (index === 1) { // Processing speed (lower is better)
                    change.textContent = `${sign}${changeValue.toFixed(2)}${units[index]}`;
                    change.className = `metric-change ${changeValue <= 0 ? 'positive' : 'negative'}`;
                } else {
                    change.textContent = `${sign}${changeValue.toFixed(1)}${units[index]}`;
                    change.className = `metric-change ${changeValue >= 0 ? 'positive' : 'negative'}`;
                }
            }
        });
    }
    
    addAccuracyDataPoint() {
        const chart = this.charts.accuracyChart;
        if (!chart) return;
        
        const now = new Date();
        const timeLabel = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Add new data point
        chart.data.labels.push(timeLabel);
        
        // Generate new accuracy values
        chart.data.datasets.forEach((dataset, index) => {
            const baseAccuracies = [96.3, 92.8, 78.4];
            const variation = (Math.random() - 0.5) * 2;
            const newAccuracy = Math.max(85, Math.min(99, baseAccuracies[index] + variation));
            
            dataset.data.push(newAccuracy);
        });
        
        // Keep only last 20 data points
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => {
                dataset.data.shift();
            });
        }
        
        chart.update('none');
    }
    
    filterAccuracyChart(modelType) {
        const chart = this.charts.accuracyChart;
        if (!chart) return;
        
        chart.data.datasets.forEach((dataset, index) => {
            if (modelType === 'all') {
                dataset.hidden = false;
            } else {
                const modelNames = ['price', 'sentiment', 'trading'];
                dataset.hidden = modelNames[index] !== modelType;
            }
        });
        
        chart.update();
    }
    
    updateSentimentData(timeframe) {
        console.log(`📊 Updating sentiment data for timeframe: ${timeframe}`);
        
        // Simulate different sentiment values for different timeframes
        const sentimentValues = {
            '1h': 0.65 + Math.random() * 0.2,
            '1d': 0.73 + Math.random() * 0.15,
            '1w': 0.68 + Math.random() * 0.25
        };
        
        const newSentiment = sentimentValues[timeframe] || 0.73;
        this.updateSentimentGauge(Math.max(0, Math.min(1, newSentiment)));
    }
    
    showInsightDetails(insightCard) {
        const title = insightCard.querySelector('h3').textContent;
        const content = insightCard.querySelector('p').textContent;
        
        // Create modal or detailed view
        const modal = this.createInsightModal(title, content);
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
    
    createInsightModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'insight-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>${content}</p>
                    <div class="insight-details">
                        <h3>Detailed Analysis:</h3>
                        <ul>
                            <li>AI confidence level: 94.2%</li>
                            <li>Data sources analyzed: 15</li>
                            <li>Historical accuracy: 89.7%</li>
                            <li>Risk assessment: Moderate</li>
                            <li>Recommended action: Monitor closely</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary">Take Action</button>
                    <button class="btn btn-secondary modal-close">Close</button>
                </div>
            </div>
        `;
        
        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Add event listeners
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            });
        });
        
        return modal;
    }
    
    dismissInsight(insightCard) {
        insightCard.style.transform = 'translateX(100%)';
        insightCard.style.opacity = '0';
        
        setTimeout(() => {
            if (insightCard.parentNode) {
                insightCard.parentNode.removeChild(insightCard);
            }
        }, 300);
        
        this.showNotification('Insight dismissed', 'info');
    }
    
    generateAccuracyData() {
        const labels = [];
        const pricePredictor = [];
        const sentimentAnalyzer = [];
        const tradingBot = [];
        
        // Generate 24 hours of data
        for (let i = 23; i >= 0; i--) {
            const time = new Date();
            time.setHours(time.getHours() - i);
            labels.push(time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }));
            
            // Generate realistic accuracy data with trends
            pricePredictor.push(94 + Math.random() * 4 + Math.sin(i * 0.3) * 2);
            sentimentAnalyzer.push(90 + Math.random() * 6 + Math.cos(i * 0.2) * 3);
            tradingBot.push(75 + Math.random() * 8 + Math.sin(i * 0.4) * 4);
        }
        
        return {
            labels,
            pricePredictor,
            sentimentAnalyzer,
            tradingBot
        };
    }
    
    showNotification(message, type = 'info') {
        // Reuse notification system from main.js
        if (window.dashboard && window.dashboard.showNotification) {
            window.dashboard.showNotification(message, type);
        } else {
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize analytics manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}