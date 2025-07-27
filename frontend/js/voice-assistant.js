// 🎤 AI Voice Assistant - Your Secret Weapon for College Fame
class VoiceAIAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.commands = {
            'show': this.handleShowCommand.bind(this),
            'analyze': this.handleAnalyzeCommand.bind(this),
            'predict': this.handlePredictCommand.bind(this),
            'buy': this.handleBuyCommand.bind(this),
            'sell': this.handleSellCommand.bind(this),
            'portfolio': this.handlePortfolioCommand.bind(this),
            'news': this.handleNewsCommand.bind(this),
            'sentiment': this.handleSentimentCommand.bind(this)
        };
        this.initializeVoiceRecognition();
        this.createVoiceUI();
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceUI('listening');
                console.log('🎤 Voice recognition started');
            };

            this.recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                console.log('🗣️ Voice command:', command);
                this.processVoiceCommand(command);
            };

            this.recognition.onerror = (event) => {
                console.error('❌ Voice recognition error:', event.error);
                this.updateVoiceUI('error');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceUI('idle');
            };
        } else {
            console.warn('⚠️ Voice recognition not supported');
        }
    }

    createVoiceUI() {
        const voiceContainer = document.createElement('div');
        voiceContainer.id = 'voice-assistant';
        voiceContainer.innerHTML = `
            <div class="voice-assistant-container">
                <div class="voice-button" id="voice-btn">
                    <i class="fas fa-microphone"></i>
                    <div class="voice-pulse"></div>
                </div>
                <div class="voice-status" id="voice-status">Click to speak</div>
                <div class="voice-commands-help">
                    <h4>Try saying:</h4>
                    <ul>
                        <li>"Show me Apple stock"</li>
                        <li>"Analyze Tesla sentiment"</li>
                        <li>"Predict Microsoft price"</li>
                        <li>"Show my portfolio"</li>
                        <li>"Buy 10 shares of Google"</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.body.appendChild(voiceContainer);
        
        // Add event listener
        document.getElementById('voice-btn').addEventListener('click', () => {
            this.toggleListening();
        });

        // Add CSS
        this.addVoiceCSS();
    }

    addVoiceCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .voice-assistant-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                color: white;
                min-width: 250px;
            }

            .voice-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
                margin: 0 auto 15px;
                transition: all 0.3s ease;
            }

            .voice-button:hover {
                transform: scale(1.1);
            }

            .voice-button.listening {
                animation: pulse 1.5s infinite;
            }

            .voice-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                animation: pulse-ring 2s infinite;
                opacity: 0;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            @keyframes pulse-ring {
                0% { transform: scale(1); opacity: 0.7; }
                100% { transform: scale(2); opacity: 0; }
            }

            .voice-status {
                text-align: center;
                font-weight: 500;
                margin-bottom: 15px;
            }

            .voice-commands-help {
                font-size: 12px;
                opacity: 0.8;
            }

            .voice-commands-help h4 {
                margin-bottom: 8px;
                color: #ffd700;
            }

            .voice-commands-help ul {
                list-style: none;
                padding: 0;
            }

            .voice-commands-help li {
                margin-bottom: 4px;
                padding-left: 15px;
                position: relative;
            }

            .voice-commands-help li:before {
                content: "🎤";
                position: absolute;
                left: 0;
            }
        `;
        document.head.appendChild(style);
    }

    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    updateVoiceUI(status) {
        const btn = document.getElementById('voice-btn');
        const statusEl = document.getElementById('voice-status');
        
        btn.className = 'voice-button';
        
        switch(status) {
            case 'listening':
                btn.classList.add('listening');
                statusEl.textContent = '🎤 Listening...';
                break;
            case 'processing':
                statusEl.textContent = '🧠 Processing...';
                break;
            case 'speaking':
                statusEl.textContent = '🗣️ Speaking...';
                break;
            case 'error':
                statusEl.textContent = '❌ Error occurred';
                break;
            default:
                statusEl.textContent = 'Click to speak';
        }
    }

    processVoiceCommand(command) {
        this.updateVoiceUI('processing');
        
        // Extract command type and parameters
        const words = command.split(' ');
        const action = words[0];
        
        if (this.commands[action]) {
            this.commands[action](command, words);
        } else {
            // Try to find command in the middle of sentence
            for (let cmd in this.commands) {
                if (command.includes(cmd)) {
                    this.commands[cmd](command, words);
                    return;
                }
            }
            this.speak("Sorry, I didn't understand that command. Try saying 'show me Apple stock' or 'analyze Tesla'.");
        }
    }

    handleShowCommand(command, words) {
        // Extract stock symbol
        const stockSymbols = ['apple', 'tesla', 'microsoft', 'google', 'amazon', 'meta', 'nvidia', 'netflix'];
        const symbolMap = {
            'apple': 'AAPL',
            'tesla': 'TSLA', 
            'microsoft': 'MSFT',
            'google': 'GOOGL',
            'amazon': 'AMZN',
            'meta': 'META',
            'nvidia': 'NVDA',
            'netflix': 'NFLX'
        };

        let symbol = 'AAPL'; // default
        for (let stock of stockSymbols) {
            if (command.includes(stock)) {
                symbol = symbolMap[stock];
                break;
            }
        }

        // Change stock selector
        document.getElementById('stock-selector').value = symbol;
        document.getElementById('stock-selector').dispatchEvent(new Event('change'));
        
        this.speak(`Showing ${symbol} stock analysis`);
        this.updateVoiceUI('speaking');
    }

    handleAnalyzeCommand(command, words) {
        if (command.includes('sentiment')) {
            this.speak("Analyzing market sentiment using advanced AI algorithms");
            // Trigger sentiment analysis
            this.triggerSentimentAnalysis();
        } else {
            this.speak("Running comprehensive stock analysis");
            // Trigger general analysis
            this.triggerStockAnalysis();
        }
        this.updateVoiceUI('speaking');
    }

    handlePredictCommand(command, words) {
        this.speak("Generating AI predictions using neural networks and machine learning models");
        // Trigger prediction update
        this.triggerPredictionUpdate();
        this.updateVoiceUI('speaking');
    }

    handleBuyCommand(command, words) {
        // Extract quantity and stock
        const quantity = this.extractNumber(command) || 1;
        const symbol = this.extractStock(command) || 'AAPL';
        
        this.speak(`Simulating buy order for ${quantity} shares of ${symbol}`);
        // Trigger buy simulation
        this.simulateTrade('buy', symbol, quantity);
        this.updateVoiceUI('speaking');
    }

    handleSellCommand(command, words) {
        const quantity = this.extractNumber(command) || 1;
        const symbol = this.extractStock(command) || 'AAPL';
        
        this.speak(`Simulating sell order for ${quantity} shares of ${symbol}`);
        this.simulateTrade('sell', symbol, quantity);
        this.updateVoiceUI('speaking');
    }

    handlePortfolioCommand(command, words) {
        this.speak("Displaying your portfolio performance and holdings");
        // Show portfolio section
        this.showPortfolio();
        this.updateVoiceUI('speaking');
    }

    handleNewsCommand(command, words) {
        this.speak("Fetching latest financial news and market updates");
        // Trigger news update
        this.updateNews();
        this.updateVoiceUI('speaking');
    }

    handleSentimentCommand(command, words) {
        const symbol = this.extractStock(command) || 'AAPL';
        this.speak(`Analyzing sentiment for ${symbol} from news and social media`);
        this.triggerSentimentAnalysis(symbol);
        this.updateVoiceUI('speaking');
    }

    extractNumber(text) {
        const numbers = text.match(/\d+/);
        return numbers ? parseInt(numbers[0]) : null;
    }

    extractStock(text) {
        const symbolMap = {
            'apple': 'AAPL', 'tesla': 'TSLA', 'microsoft': 'MSFT',
            'google': 'GOOGL', 'amazon': 'AMZN', 'meta': 'META',
            'nvidia': 'NVDA', 'netflix': 'NFLX'
        };

        for (let [name, symbol] of Object.entries(symbolMap)) {
            if (text.includes(name)) {
                return symbol;
            }
        }
        return null;
    }

    speak(text) {
        if (this.synthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            utterance.onend = () => {
                this.updateVoiceUI('idle');
            };
            
            this.synthesis.speak(utterance);
        }
    }

    // Integration methods with existing dashboard
    triggerSentimentAnalysis(symbol = null) {
        // Trigger existing sentiment analysis
        if (window.dashboard && window.dashboard.loadSentimentData) {
            window.dashboard.loadSentimentData(symbol);
        }
    }

    triggerStockAnalysis() {
        // Trigger existing stock analysis
        if (window.dashboard && window.dashboard.refreshData) {
            window.dashboard.refreshData();
        }
    }

    triggerPredictionUpdate() {
        // Trigger existing prediction update
        if (window.dashboard && window.dashboard.loadPredictions) {
            window.dashboard.loadPredictions();
        }
    }

    simulateTrade(action, symbol, quantity) {
        // Integrate with existing trading system
        console.log(`Voice trade: ${action} ${quantity} ${symbol}`);
        // You can integrate this with your existing trading modal
    }

    showPortfolio() {
        // Scroll to portfolio section or highlight it
        const portfolioSection = document.getElementById('portfolio-summary');
        if (portfolioSection) {
            portfolioSection.scrollIntoView({ behavior: 'smooth' });
            portfolioSection.style.border = '2px solid #ffd700';
            setTimeout(() => {
                portfolioSection.style.border = '';
            }, 3000);
        }
    }

    updateNews() {
        // Trigger news update
        if (window.dashboard && window.dashboard.loadNews) {
            window.dashboard.loadNews();
        }
    }
}

// Initialize voice assistant when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAssistant = new VoiceAIAssistant();
    console.log('🎤 Voice AI Assistant initialized!');
});