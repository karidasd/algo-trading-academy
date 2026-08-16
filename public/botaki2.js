const startBtn = document.getElementById('startBotBtn');
const stopBtn = document.getElementById('stopBotBtn');
const terminal = document.getElementById('botTerminal');
const livePriceEl = document.getElementById('livePrice');
const supLevelEl = document.getElementById('supLevel');
const resLevelEl = document.getElementById('resLevel');
const simPnlEl = document.getElementById('simPnl');

let isRunning = false;
let botInterval;
let prices = [];

// S&R Levels
let support = null;
let resistance = null;

// Simulated Account
let openTrade = null; 
let totalPnl = 0;

function logTerminal(msg, type = 'info') {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span class="log-time">[${time}]</span><span class="log-msg ${type}"> ${msg}</span>`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
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
    prices.push(currentPrice);
    
    // Keep a rolling window of 10 ticks to find local high/low
    if (prices.length > 10) prices.shift();

    if (prices.length < 5) {
        logTerminal(`Mapping market structure... (${prices.length}/5)`);
        return;
    }

    // Dynamically calculate Support (lowest in window) and Resistance (highest)
    support = Math.min(...prices);
    resistance = Math.max(...prices);

    supLevelEl.innerText = support.toFixed(5);
    resLevelEl.innerText = resistance.toFixed(5);

    // If we have an open trade, check exit conditions
    if (openTrade) {
        let pnl = 0;
        if (openTrade.type === 'BUY') {
            pnl = (currentPrice - openTrade.entryPrice) * 100000;
        } else {
            pnl = (openTrade.entryPrice - currentPrice) * 100000;
        }

        // Close logic: If PnL > $10 or PnL < -$5
        if (pnl > 10 || pnl < -5) {
            totalPnl += pnl;
            simPnlEl.innerText = `$${totalPnl.toFixed(2)}`;
            simPnlEl.style.color = totalPnl >= 0 ? 'var(--success)' : 'var(--danger)';
            logTerminal(`Closed ${openTrade.type} position. PnL: $${pnl.toFixed(2)}`, pnl > 0 ? 'profit' : 'sell');
            openTrade = null;
        }
    } 
    // If no open trade, look for entry at Support or Resistance
    else {
        // If current price drops very close to Support, BUY
        if (currentPrice <= support + 0.00010 && currentPrice !== resistance) {
            openTrade = { type: 'BUY', entryPrice: currentPrice };
            logTerminal(`Price hit Support floor! Bouncing up.`, 'info');
            logTerminal(`Executed BUY at ${currentPrice.toFixed(5)}`, 'buy');
        } 
        // If current price rises very close to Resistance, SELL
        else if (currentPrice >= resistance - 0.00010 && currentPrice !== support) {
            openTrade = { type: 'SELL', entryPrice: currentPrice };
            logTerminal(`Price hit Resistance ceiling! Rejected down.`, 'info');
            logTerminal(`Executed SELL at ${currentPrice.toFixed(5)}`, 'sell');
        } else {
            logTerminal(`Price: ${currentPrice.toFixed(5)} wandering between S&R...`);
        }
    }
}

startBtn.addEventListener('click', () => {
    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    logTerminal("S&R Scanner Started.", "profit");
    botInterval = setInterval(botTick, 2000);
});

stopBtn.addEventListener('click', () => {
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    clearInterval(botInterval);
    prices = [];
    logTerminal("Scanner Stopped.", "sell");
});
