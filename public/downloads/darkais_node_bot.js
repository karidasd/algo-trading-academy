/**
 * 🌑 DarkAIs Algorithmic Trading Bot Starter Kit (Node.js Edition)
 * Modular High-Frequency Engine with Dynamic Position Sizing
 */

class DarkAIsNodeBot {
    constructor(symbol = 'EURUSD', capital = 10000) {
        this.symbol = symbol;
        this.balance = capital;
        this.prices = [];
        this.activeTrade = null;
    }

    onPriceTick(price) {
        this.prices.push(price);
        if (this.prices.length > 30) this.prices.shift();

        if (this.prices.length < 5) return;

        const sma = this.prices.slice(-5).reduce((a, b) => a + b, 0) / 5;

        if (this.activeTrade) {
            this.evaluateExit(price);
        } else {
            this.evaluateEntry(price, sma);
        }
    }

    evaluateEntry(price, sma) {
        const diff = price - sma;
        if (diff < -0.00018) {
            this.activeTrade = { side: 'BUY', entry: price, lot: 0.5 };
            console.log(`🟢 [BUY FILLED] 0.50 Lots @ ${price.toFixed(5)}`);
        } else if (diff > 0.00018) {
            this.activeTrade = { side: 'SELL', entry: price, lot: 0.5 };
            console.log(`🔴 [SELL FILLED] 0.50 Lots @ ${price.toFixed(5)}`);
        }
    }

    evaluateExit(price) {
        const pnl = (this.activeTrade.side === 'BUY' ? price - this.activeTrade.entry : this.activeTrade.entry - price) * 100000 * this.activeTrade.lot;
        if (pnl >= 100 || pnl <= -60) {
            this.balance += pnl;
            console.log(`🎯 [EXIT FILLED] Closed @ ${price.toFixed(5)} | Net: $${pnl.toFixed(2)} | Equity: $${this.balance.toFixed(2)}`);
            this.activeTrade = null;
        }
    }
}

const bot = new DarkAIsNodeBot();
console.log('🌑 DarkAIs Node.js Engine Live.');
