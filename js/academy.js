/* ==========================================================================
   🌑 DARKAIS ACADEMY — PROGRESS, THEME, QUIZ & SPOTLIGHT SEARCH ENGINE
   ========================================================================== */

const STORAGE_KEY = 'darkais_academy_progress';
const THEME_KEY = 'darkais_academy_theme';
const MUTE_KEY = 'darkais_academy_muted';

// Audio Effects
let isMuted = localStorage.getItem(MUTE_KEY) === 'true';
const audioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ? new (window.AudioContext || window.webkitAudioContext)() : null;

function playSound(type) {
    if (isMuted || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(146.83, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'trade') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
}

// ── THEME MANAGEMENT ─────────────────────────────────────────────
function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'cyan';
    setTheme(saved);
}

function setTheme(theme) {
    document.body.classList.remove('theme-matrix', 'theme-gold', 'theme-purple');
    if (theme !== 'cyan') {
        document.body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem(THEME_KEY, theme);
}

function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem(MUTE_KEY, isMuted);
    const btn = document.getElementById('muteBtn');
    if (btn) btn.innerText = isMuted ? '🔇' : '🔊';
}

// ── PROGRESS MANAGEMENT ──────────────────────────────────────────
function getProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { completed: [], score: 0 };
    } catch (e) {
        return { completed: [], score: 0 };
    }
}

function markLessonCompleted(lessonId) {
    const prog = getProgress();
    if (!prog.completed.includes(lessonId)) {
        prog.completed.push(lessonId);
        prog.score += 100;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
        playSound('success');
    }
    updateProgressUI();
}

function updateProgressUI() {
    const TOTAL_LESSONS = 12;
    const prog = getProgress();
    const count = prog.completed.length;
    const pct = Math.round((count / TOTAL_LESSONS) * 100);
    
    const barEl = document.getElementById('globalProgressBar');
    const textEl = document.getElementById('globalProgressText');
    if (barEl) barEl.style.width = `${pct}%`;
    if (textEl) textEl.innerText = `${pct}% (${count}/${TOTAL_LESSONS})`;
    
    prog.completed.forEach(id => {
        const card = document.querySelector(`[data-lesson-id="${id}"]`);
        if (card) card.classList.add('completed');
        const sideItem = document.querySelector(`[data-sidebar-id="${id}"]`);
        if (sideItem) sideItem.classList.add('done');
    });
}

// ── SPOTLIGHT SEARCH (CTRL+K) ─────────────────────────────────────
const SEARCH_INDEX = [
    { title: "Course 01: Gateway to Trading & Order Execution", url: "courses/01_gateway.html", type: "Module", tags: "orderbook bids asks slippage market limit" },
    { title: "Course 02: Financial Markets & Asset Dynamics", url: "courses/02_markets.html", type: "Module", tags: "forex stocks crypto liquidity volume" },
    { title: "Course 03: Forex Anatomy: Pips, Lots & Leverage", url: "courses/03_forex.html", type: "Module", tags: "pips lots margin leverage position sizing" },
    { title: "Course 04: Candlestick Secrets & Pattern Recognition", url: "courses/04_candlesticks.html", type: "Module", tags: "ohlc pinbar engulfing hammer wicks" },
    { title: "Course 05: Support & Resistance / Order Blocks", url: "courses/05_support_resistance.html", type: "Module", tags: "botaki support resistance range trader" },
    { title: "Course 06: Quantitative Indicators: SMA, RSI & MACD", url: "courses/06_indicators.html", type: "Module", tags: "botaki moving average rsi macd mean reversion" },
    { title: "Course 07: Macroeconomics & News Sniping", url: "courses/07_fundamentals.html", type: "Module", tags: "cpi nfp interest rates news sniper" },
    { title: "Course 08: Sentiment Analysis & Statistical Arbitrage", url: "courses/08_statistical_sentiment.html", type: "Module", tags: "contrarian pairs trading z-score sentiment" },
    { title: "Course 09: Risk Management & Psychological Bias", url: "courses/09_risk_psychology.html", type: "Module", tags: "drawdown 90/90/90 rule risk math fomo" },
    { title: "Course 10: Broker APIs, WebSockets & Platforms", url: "courses/10_apis_platforms.html", type: "Module", tags: "mt5 ctrader rest websocket fix protocol" },
    { title: "Course 11: Bot Architecture & Full Code Templates", url: "courses/11_system_architecture.html", type: "Module", tags: "python node bot code architecture template" },
    { title: "Course 12: Prop Firm Mastery & FTMO Challenges", url: "courses/12_prop_firm_challenge.html", type: "Module", tags: "ftmo max daily loss challenge funded" },
    { title: "⚡ Solana & DEX Memecoin Sniper Simulator", url: "solana.html", type: "Tool", tags: "solana raydium sniper memecoin jito anti-mev rugpull" },
    { title: "📓 Trader's Performance Journal & Equity Tracker", url: "journal.html", type: "Tool", tags: "journal log trades winrate profit factor equity curve" },
    { title: "🎯 Multi-Timeframe Confluence Matrix", url: "confluence.html", type: "Tool", tags: "confluence 4h 15m 1m market structure bos choch" },
    { title: "🧠 Trading Psychology & Dilemma Simulator", url: "psychology.html", type: "Tool", tags: "psychology cognitive bias discipline loss aversion fomo" },
    { title: "🌲 Pine Script v5 Code Generator", url: "pinescript.html", type: "Tool", tags: "pine script tradingview indicator strategy builder" },
    { title: "🧮 FTMO Challenge & Risk Calculator", url: "calculator.html", type: "Tool", tags: "lot size calculator daily loss drawdown" },
    { title: "📊 Live TradingView Terminal", url: "charts.html", type: "Tool", tags: "real-time charts eurusd gold btc sol" },
    { title: "🎲 Monte Carlo 500-Universe Risk Simulator", url: "montecarlo.html", type: "Tool", tags: "monte carlo risk of ruin bankruptcy simulation" },
    { title: "🎯 Candlestick Pattern Reflex Game", url: "game.html", type: "Game", tags: "speed game flashcards pattern training" },
    { title: "📰 Economic News Calendar & Circuit Breaker", url: "calendar.html", type: "Tool", tags: "news calendar nfp cpi auto-pause" },
    { title: "🤖 AI Trading Bot Prompts Vault", url: "prompts.html", type: "Resource", tags: "chatgpt claude prompts ai bot python" },
    { title: "📦 Downloadable Bot Starter Pack", url: "downloads.html", type: "Code", tags: "python node mq5 ea downloads" },
    { title: "🎓 Graduation Diploma Studio", url: "certificate.html", type: "Certificate", tags: "diploma certificate verification mastery" },
    { title: "📖 Trader's & Quant Dictionary", url: "glossary.html", type: "Reference", tags: "glossary dictionary terms slippage sharpe ratio" }
];

function setupSpotlight() {
    let overlay = document.getElementById('spotlightOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'spotlightOverlay';
        overlay.className = 'spotlight-overlay';
        overlay.innerHTML = `
            <div class="spotlight-modal">
                <div class="spotlight-input-box">
                    <span>🔍</span>
                    <input type="text" id="spotlightSearchInput" class="spotlight-input" placeholder="Search modules, tools, indicators, bot code... (Esc to close)">
                </div>
                <div class="spotlight-results" id="spotlightResultsList"></div>
                <div class="spotlight-footer">
                    <span>Use <strong>↑</strong> <strong>↓</strong> to navigate</span>
                    <span>Press <strong>Enter</strong> to select • <strong>Esc</strong> to close</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    const input = document.getElementById('spotlightSearchInput');
    const resultsList = document.getElementById('spotlightResultsList');

    function openSpotlight() {
        overlay.classList.add('open');
        input.value = '';
        renderResults('');
        input.focus();
    }

    function closeSpotlight() {
        overlay.classList.remove('open');
    }

    function renderResults(query) {
        const q = query.toLowerCase().trim();
        const matches = SEARCH_INDEX.filter(item => 
            q === '' || item.title.toLowerCase().includes(q) || item.tags.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
        ).slice(0, 7);

        resultsList.innerHTML = matches.map((m, idx) => {
            const isInsideCourses = window.location.pathname.includes('/courses/');
            const linkUrl = isInsideCourses && !m.url.startsWith('courses/') ? `../${m.url}` : (isInsideCourses && m.url.startsWith('courses/') ? m.url.replace('courses/', '') : m.url);
            
            return `
                <div class="spotlight-item ${idx === 0 ? 'active' : ''}" onclick="window.location.href='${linkUrl}'">
                    <span>${m.title}</span>
                    <span class="item-type">${m.type}</span>
                </div>
            `;
        }).join('');
    }

    input.addEventListener('input', (e) => renderResults(e.target.value));

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            overlay.classList.contains('open') ? closeSpotlight() : openSpotlight();
        }
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
            closeSpotlight();
        }
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeSpotlight();
    });

    const triggerBtn = document.getElementById('searchTriggerBtn');
    if (triggerBtn) triggerBtn.addEventListener('click', openSpotlight);
}

// ── QUIZ VALIDATION ENGINE ────────────────────────────────────────
function setupQuiz(correctIndex, explanation, lessonId) {
    const container = document.getElementById('quizBox');
    if (!container) return;
    
    const options = container.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('quizFeedback');
    const submitBtn = document.getElementById('quizSubmitBtn');
    let selectedIdx = null;
    
    options.forEach((opt, idx) => {
        opt.addEventListener('click', () => {
            if (container.dataset.locked === 'true') return;
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedIdx = idx;
            if (submitBtn) submitBtn.disabled = false;
        });
    });
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (selectedIdx === null) return;
            container.dataset.locked = 'true';
            submitBtn.disabled = true;
            
            if (selectedIdx === correctIndex) {
                options[selectedIdx].classList.add('correct');
                feedback.className = 'quiz-feedback show success';
                feedback.innerHTML = `<strong>✓ Correct!</strong> ${explanation}`;
                markLessonCompleted(lessonId);
            } else {
                options[selectedIdx].classList.add('wrong');
                options[correctIndex].classList.add('correct');
                feedback.className = 'quiz-feedback show error';
                feedback.innerHTML = `<strong>✕ Incorrect.</strong> ${explanation}`;
                playSound('error');
            }
        });
    }
}

// ── COPY UTILITY ──────────────────────────────────────────────────
function copyCode(btn) {
    const pre = btn.closest('.code-block, .prompt-card')?.querySelector('pre code, .prompt-body');
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(() => {
        const oldText = btn.innerText;
        btn.innerText = 'COPIED!';
        setTimeout(() => { btn.innerText = oldText; }, 2000);
        playSound('trade');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateProgressUI();
    setupSpotlight();
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) muteBtn.innerText = isMuted ? '🔇' : '🔊';
});
