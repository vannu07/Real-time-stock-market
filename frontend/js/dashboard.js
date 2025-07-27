// 📊 DASHBOARD SPECIFIC FUNCTIONALITY

class DashboardManager {
    constructor() {
        this.refreshInterval = null;
        this.autoRefreshEnabled = true;
        this.refreshRate = 30000; // 30 seconds
        
        this.init();
    }
    
    init() {
        this.setupAutoRefresh();
        this.setupExportFunctionality();
        this.setupKeyboardShortcuts();
        this.setupTooltips();
        
        console.log('📊 Dashboard Manager initialized');
    }
    
    setupAutoRefresh() {
        // Auto-refresh toggle
        const autoRefreshToggle = this.createAutoRefreshToggle();
        const analysisControls = document.querySelector('.analysis-controls');
        if (analysisControls) {
            analysisControls.appendChild(autoRefreshToggle);
        }
        
        // Start auto-refresh
        this.startAutoRefresh();
    }
    
    createAutoRefreshToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'control-btn auto-refresh-toggle';
        toggle.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>Auto-refresh: ON</span>
        `;
        
        toggle.addEventListener('click', () => {
            this.toggleAutoRefresh();
            const span = toggle.querySelector('span');
            const icon = toggle.querySelector('i');
            
            if (this.autoRefreshEnabled) {
                span.textContent = 'Auto-refresh: ON';
                icon.style.animation = 'spin 2s linear infinite';
            } else {
                span.textContent = 'Auto-refresh: OFF';
                icon.style.animation = 'none';
            }
        });
        
        return toggle;
    }
    
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        if (this.autoRefreshEnabled) {
            this.refreshInterval = setInterval(() => {
                if (window.dashboard && window.dashboard.currentStock) {
                    console.log('🔄 Auto-refreshing data...');
                    window.dashboard.loadStockData(window.dashboard.currentStock, false);
                }
            }, this.refreshRate);
        }
    }
    
    toggleAutoRefresh() {
        this.autoRefreshEnabled = !this.autoRefreshEnabled;
        this.startAutoRefresh();
    }
    
    setupExportFunctionality() {
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAnalysis();
            });
        }
    }
    
    exportAnalysis() {
        if (!window.dashboard || !window.dashboard.currentStock) {
            window.dashboard.showNotification('No data to export', 'warning');
            return;
        }
        
        const data = this.gatherAnalysisData();
        const filename = `${window.dashboard.currentStock}_analysis_${new Date().toISOString().split('T')[0]}.json`;
        
        this.downloadJSON(data, filename);
        window.dashboard.showNotification('Analysis exported successfully', 'success');
    }
    
    gatherAnalysisData() {
        const currentStock = window.dashboard.currentStock;
        
        // Gather data from dashboard
        const analysisData = {
            symbol: currentStock,
            timestamp: new Date().toISOString(),
            
            // Price data
            priceData: {
                current: this.extractCurrentPrice(),
                chart: this.extractChartData()
            },
            
            // Sentiment data
            sentiment: this.extractSentimentData(),
            
            // Trading signals
            signals: this.extractTradingSignals(),
            
            // Key metrics
            metrics: this.extractKeyMetrics(),
            
            // AI insights
            insights: this.extractAIInsights()
        };
        
        return analysisData;
    }
    
    extractCurrentPrice() {
        const priceElement = document.querySelector(`[data-symbol="${window.dashboard.currentStock}"] .stock-price`);
        return priceElement ? priceElement.textContent : null;
    }
    
    extractChartData() {
        if (window.dashboard.charts.priceChart) {
            return {
                labels: window.dashboard.charts.priceChart.data.labels,
                values: window.dashboard.charts.priceChart.data.datasets[0].data
            };
        }
        return null;
    }
    
    extractSentimentData() {
        const sentimentScore = document.getElementById('sentimentScore');
        if (sentimentScore) {
            return {
                score: sentimentScore.querySelector('.score-value').textContent,
                label: sentimentScore.querySelector('.score-label').textContent,
                breakdown: this.extractSentimentBreakdown()
            };
        }
        return null;
    }
    
    extractSentimentBreakdown() {
        const breakdown = {};
        document.querySelectorAll('.sentiment-source').forEach(source => {
            const name = source.querySelector('.source-name').textContent;
            const value = source.querySelector('.sentiment-value').textContent;
            breakdown[name] = value;
        });
        return breakdown;
    }
    
    extractTradingSignals() {
        const signalItem = document.querySelector('.signal-item');
        if (signalItem) {
            const signalInfo = signalItem.querySelector('.signal-info');
            const reasoning = Array.from(document.querySelectorAll('.signal-reasoning li'))
                .map(li => li.textContent);
            
            return {
                type: signalInfo.querySelector('h4').textContent,
                confidence: signalInfo.querySelectorAll('p')[0].textContent,
                target: signalInfo.querySelectorAll('p')[1].textContent,
                reasoning: reasoning
            };
        }
        return null;
    }
    
    extractKeyMetrics() {
        const metrics = {};
        document.querySelectorAll('.metric-item').forEach(item => {
            const label = item.querySelector('.metric-label').textContent;
            const value = item.querySelector('.metric-value').textContent;
            metrics[label] = value;
        });
        return metrics;
    }
    
    extractAIInsights() {
        const insights = [];
        document.querySelectorAll('.insight-card').forEach(card => {
            insights.push({
                title: card.querySelector('h3').textContent,
                content: card.querySelector('p').textContent
            });
        });
        return insights;
    }
    
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R: Refresh data
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                if (window.dashboard && window.dashboard.currentStock) {
                    window.dashboard.loadStockData(window.dashboard.currentStock);
                }
            }
            
            // Ctrl/Cmd + E: Export data
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportAnalysis();
            }
            
            // Ctrl/Cmd + 3: Toggle 3D view
            if ((e.ctrlKey || e.metaKey) && e.key === '3') {
                e.preventDefault();
                window.dashboard.toggle3DView();
            }
            
            // Space: Toggle voice assistant
            if (e.key === ' ' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (window.dashboard.voiceAssistant) {
                    window.dashboard.voiceAssistant.toggleListening();
                }
            }
            
            // Number keys 1-6: Select stock
            if (e.key >= '1' && e.key <= '6' && !e.ctrlKey && !e.metaKey) {
                const stocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META'];
                const index = parseInt(e.key) - 1;
                if (stocks[index]) {
                    window.dashboard.selectStock(stocks[index]);
                }
            }
        });
    }
    
    setupTooltips() {
        // Add tooltips to various elements
        this.addTooltip('.voice-btn', 'Click to activate voice control (Spacebar)');
        this.addTooltip('.toggle-btn', 'Switch to 3D visualization (Ctrl+3)');
        this.addTooltip('#refreshBtn', 'Refresh current data (Ctrl+R)');
        this.addTooltip('#exportBtn', 'Export analysis data (Ctrl+E)');
        
        // Stock selection tooltips
        document.querySelectorAll('.stock-card').forEach((card, index) => {
            const symbol = card.dataset.symbol;
            this.addTooltip(card, `Select ${symbol} for analysis (Press ${index + 1})`);
        });
    }
    
    addTooltip(selector, text) {
        const elements = typeof selector === 'string' ? 
            document.querySelectorAll(selector) : [selector];
        
        elements.forEach(element => {
            if (!element) return;
            
            element.setAttribute('title', text);
            
            // Enhanced tooltip with custom styling
            element.addEventListener('mouseenter', (e) => {
                this.showCustomTooltip(e.target, text);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideCustomTooltip();
            });
        });
    }
    
    showCustomTooltip(element, text) {
        // Remove existing tooltip
        this.hideCustomTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 8;
        
        // Adjust if tooltip goes off screen
        if (left < 0) left = 8;
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 8;
        }
        if (top < 0) {
            top = rect.bottom + 8;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        
        // Fade in
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(4px)';
        tooltip.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        
        setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        }, 10);
    }
    
    hideCustomTooltip() {
        const tooltip = document.querySelector('.custom-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(4px)';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 200);
        }
    }
    
    // Performance monitoring
    startPerformanceMonitoring() {
        setInterval(() => {
            const performance = {
                memory: this.getMemoryUsage(),
                timing: this.getPageTiming(),
                charts: this.getChartPerformance()
            };
            
            console.log('📊 Dashboard Performance:', performance);
        }, 60000); // Every minute
    }
    
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
    
    getPageTiming() {
        const timing = performance.timing;
        return {
            loadTime: timing.loadEventEnd - timing.navigationStart,
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
        };
    }
    
    getChartPerformance() {
        return {
            activeCharts: Object.keys(window.dashboard?.charts || {}).length,
            lastUpdate: window.dashboard?.lastUpdateTime || null
        };
    }
}

// Enhanced chart utilities
class ChartUtils {
    static createGradient(ctx, color1, color2) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    }
    
    static getChartOptions(type = 'line') {
        const baseOptions = {
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
            }
        };
        
        if (type === 'line') {
            baseOptions.elements = {
                point: {
                    radius: 0,
                    hoverRadius: 6
                }
            };
        }
        
        return baseOptions;
    }
    
    static animateChart(chart, duration = 1000) {
        chart.update('active', {
            duration: duration,
            easing: 'easeInOutQuart'
        });
    }
}

// Initialize dashboard manager
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
    
    // Start performance monitoring in development
    if (window.location.hostname === 'localhost') {
        window.dashboardManager.startPerformanceMonitoring();
    }
});

// Export utilities
window.ChartUtils = ChartUtils;