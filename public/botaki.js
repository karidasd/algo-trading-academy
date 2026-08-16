const startBtn = document.getElementById('startBotBtn');
const stopBtn = document.getElementById('stopBotBtn');
const terminal = document.getElementById('botTerminal');
const livePriceEl = document.getElementById('livePrice');
const openPositionsEl = document.getElementById('openPositions');
const simPnlEl = document.getElementById('simPnl');

let isRunning = false;
let botInterval;
let prices = [];
const movingAveragePeriod = 5; 

// Simulated Account
let openTrade = null; // { type: 'BUY'|'SELL', entryPrice: number }
let totalPnl = 0;

function logTerminal(msg, type = 'info') {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span class="log-time">[${time}]</span><span class="log-msg ${type}"> ${msg}</span>`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

function calculateSMA(data) {
    if (data.length === 0) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
}

async function fetchLivePrice() {
    try {
        const res = await fetch('/api/forex/eurusd');
        const data = await res.json();
        return data.price;
    } catch (e) {
        logTerminal("Error fetching price data.", "sell");
        return null;
    }
}

async function botTick() {
    if (!isRunning) return;

    const currentPrice = await fetchLivePrice();
    if (!currentPrice) return;

    livePriceEl.innerText = currentPrice.toFixed(5);

    // Keep history for SMA
    prices.push(currentPrice);
    if (prices.length > movingAveragePeriod) {
        prices.shift();
    }

    if (prices.length < movingAveragePeriod) {
        logTerminal(`Gathering data... (${prices.length}/${movingAveragePeriod})`);
        return;
    }

    const sma = calculateSMA(prices);
    
    // Trading Logic: Mean Reversion
    // If price drops 5 pips below SMA -> BUY
    // If price rises 5 pips above SMA -> SELL
    const diff = currentPrice - sma;
    const threshold = 0.00020; // 2 pips for fast simulation

    // If we have an open trade, check exit conditions (TP or SL)
    if (openTrade) {
        let pnl = 0;
        if (openTrade.type === 'BUY') {
            pnl = (currentPrice - openTrade.entryPrice) * 100000; // Pip calculation for 1 standard lot
        } else {
            pnl = (openTrade.entryPrice - currentPrice) * 100000;
        }

        // Close logic: If PnL > $15 or PnL < -$10
        if (pnl > 15 || pnl < -10) {
            totalPnl += pnl;
            simPnlEl.innerText = `$${totalPnl.toFixed(2)}`;
            simPnlEl.style.color = totalPnl >= 0 ? 'var(--success)' : 'var(--danger)';
            logTerminal(`Closed ${openTrade.type} position. PnL: $${pnl.toFixed(2)}`, pnl > 0 ? 'profit' : 'sell');
            openTrade = null;
            openPositionsEl.innerText = '0';
        }
    } 
    // If no open trade, look for entry
    else {
        if (diff < -threshold) {
            // Price is below SMA -> Oversold -> BUY
            openTrade = { type: 'BUY', entryPrice: currentPrice };
            openPositionsEl.innerText = '1';
            logTerminal(`Oversold detected! (Price: ${currentPrice.toFixed(5)} < SMA: ${sma.toFixed(5)})`, 'info');
            logTerminal(`Executed BUY at ${currentPrice.toFixed(5)}`, 'buy');
        } else if (diff > threshold) {
            // Price is above SMA -> Overbought -> SELL
            openTrade = { type: 'SELL', entryPrice: currentPrice };
            openPositionsEl.innerText = '1';
            logTerminal(`Overbought detected! (Price: ${currentPrice.toFixed(5)} > SMA: ${sma.toFixed(5)})`, 'info');
            logTerminal(`Executed SELL at ${currentPrice.toFixed(5)}`, 'sell');
        } else {
            logTerminal(`Price: ${currentPrice.toFixed(5)} | SMA: ${sma.toFixed(5)} -> Waiting for setup...`);
        }
    }
}

startBtn.addEventListener('click', () => {
    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    logTerminal("Simulation Started. Tracking EUR/USD.", "profit");
    botInterval = setInterval(botTick, 2000); // Check every 2 seconds
});

stopBtn.addEventListener('click', () => {
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    clearInterval(botInterval);
    logTerminal("Simulation Stopped.", "sell");
});
