/* ==========================================================================
   🌑 DARKAIS ACADEMY — UNIVERSAL BOTAKI TRADING ENGINE
   ========================================================================== */

class BotakiEngine {
    constructor(config) {
        this.strategy = config.strategy || 'mean_reversion'; // 'mean_reversion' | 'sr_range' | 'rsi'
        this.symbol = config.symbol || 'EUR/USD';
        this.terminalId = config.terminalId || 'botTerminal';
        this.chartId = config.chartId || null;
        this.intervalMs = config.intervalMs || 1500;
        
        this.prices = [];
        this.openTrade = null;
        this.totalPnl = 0;
        this.tradeCount = 0;
        this.wins = 0;
        this.isRunning = false;
        this.timer = null;

        this.chart = this.chartId ? new SimpleChart(this.chartId) : null;
        this.initDOM(config);
    }

    initDOM(config) {
        this.startBtn = document.getElementById(config.startBtnId || 'startBotBtn');
        this.stopBtn = document.getElementById(config.stopBtnId || 'stopBotBtn');
        this.livePriceEl = document.getElementById(config.livePriceId || 'livePrice');
        this.pnlEl = document.getElementById(config.pnlId || 'simPnl');
        this.terminal = document.getElementById(this.terminalId);

        if (this.startBtn) this.startBtn.addEventListener('click', () => this.start());
        if (this.stopBtn) this.stopBtn.addEventListener('click', () => this.stop());
    }

    log(msg, type = 'info') {
        if (!this.terminal) return;
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const line = document.createElement('div');
        line.className = 'term-line';
        
        let typeClass = 'term-info';
        if (type === 'buy') typeClass = 'term-buy';
        if (type === 'sell') typeClass = 'term-sell';
        if (type === 'profit') typeClass = 'term-highlight';

        line.innerHTML = `<span class="term-time">[${time}]</span><span class="${typeClass}"> ${msg}</span>`;
        this.terminal.appendChild(line);
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    async fetchPrice() {
        try {
            const res = await fetch('/api/forex/eurusd');
            if (res.ok) {
                const data = await res.json();
                return data.price;
            }
        } catch (e) {}
        
        // Client-side fallback for GitHub Pages & static hosting
        const time = Date.now();
        const base = 1.08500;
        const wave = Math.sin(time / 3500) * 0.0018;
        const noise = (Math.random() - 0.5) * 0.0004;
        return parseFloat((base + wave + noise).toFixed(5));
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        if (this.startBtn) this.startBtn.disabled = true;
        if (this.stopBtn) this.stopBtn.disabled = false;
        this.log(`🚀 [${this.strategy.toUpperCase()}] Botaki active. Scanning ${this.symbol}...`, 'profit');
        if (typeof playSound === 'function') playSound('trade');
        this.timer = setInterval(() => this.tick(), this.intervalMs);
    }

    stop() {
        this.isRunning = false;
        if (this.startBtn) this.startBtn.disabled = false;
        if (this.stopBtn) this.stopBtn.disabled = true;
        clearInterval(this.timer);
        this.log(`🛑 Botaki stopped. Final Session PnL: $${this.totalPnl.toFixed(2)}`, 'sell');
    }

    async tick() {
        if (!this.isRunning) return;
        const price = await this.fetchPrice();
        this.prices.push(price);
        if (this.prices.length > 30) this.prices.shift();

        if (this.livePriceEl) this.livePriceEl.innerText = price.toFixed(5);

        let sma = null;
        if (this.prices.length >= 5) {
            sma = this.prices.slice(-5).reduce((a,b)=>a+b,0) / 5;
        }

        if (this.chart) {
            this.chart.addTick(price, sma);
        }

        if (this.prices.length < 5) {
            this.log(`📊 Ingesting market ticks (${this.prices.length}/5)...`);
            return;
        }

        // ── MANAGE OPEN POSITION ─────────────────────────────────────
        if (this.openTrade) {
            let pnl = 0;
            if (this.openTrade.type === 'BUY') {
                pnl = (price - this.openTrade.entryPrice) * 100000;
            } else {
                pnl = (this.openTrade.entryPrice - price) * 100000;
            }

            // Close at TP ($12) or SL (-$8)
            if (pnl >= 12 || pnl <= -8) {
                this.totalPnl += pnl;
                this.tradeCount++;
                if (pnl > 0) this.wins++;
                
                if (this.pnlEl) {
                    this.pnlEl.innerText = `$${this.totalPnl.toFixed(2)}`;
                    this.pnlEl.style.color = this.totalPnl >= 0 ? 'var(--success)' : 'var(--danger)';
                }

                this.log(`🎯 Closed ${this.openTrade.type} @ ${price.toFixed(5)} | Net: $${pnl.toFixed(2)}`, pnl > 0 ? 'profit' : 'sell');
                if (typeof playSound === 'function') playSound(pnl > 0 ? 'success' : 'error');
                this.openTrade = null;
            }
        } 
        // ── SCAN FOR ENTRY ──────────────────────────────────────────
        else {
            if (this.strategy === 'mean_reversion' && sma) {
                const diff = price - sma;
                if (diff < -0.00015) {
                    this.openTrade = { type: 'BUY', entryPrice: price };
                    this.log(`⚡ Mean Reversion: Oversold dip detected below SMA!`, 'info');
                    this.log(`🟢 BUY 1.0 Lot @ ${price.toFixed(5)}`, 'buy');
                    if (typeof playSound === 'function') playSound('trade');
                } else if (diff > 0.00015) {
                    this.openTrade = { type: 'SELL', entryPrice: price };
                    this.log(`⚡ Mean Reversion: Overbought spike detected above SMA!`, 'info');
                    this.log(`🔴 SELL 1.0 Lot @ ${price.toFixed(5)}`, 'sell');
                    if (typeof playSound === 'function') playSound('trade');
                }
            } else if (this.strategy === 'sr_range') {
                const sup = Math.min(...this.prices.slice(-10));
                const res = Math.max(...this.prices.slice(-10));
                if (price <= sup + 0.00008) {
                    this.openTrade = { type: 'BUY', entryPrice: price };
                    this.log(`🧱 Bounce from Support Floor: ${sup.toFixed(5)}`, 'info');
                    this.log(`🟢 BUY 1.0 Lot @ ${price.toFixed(5)}`, 'buy');
                    if (typeof playSound === 'function') playSound('trade');
                } else if (price >= res - 0.00008) {
                    this.openTrade = { type: 'SELL', entryPrice: price };
                    this.log(`🧱 Rejection from Resistance Ceiling: ${res.toFixed(5)}`, 'info');
                    this.log(`🔴 SELL 1.0 Lot @ ${price.toFixed(5)}`, 'sell');
                    if (typeof playSound === 'function') playSound('trade');
                }
            }
        }
    }
}
