import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve root and public static assets
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Multi-asset simulated price feed for Botaki simulators and Strategy Sandbox
app.get('/api/forex/:pair', (req, res) => {
    const pair = (req.params.pair || 'eurusd').toUpperCase();
    const time = Date.now();
    
    let base = 1.08500;
    if (pair.includes('GBP')) base = 1.29500;
    if (pair.includes('BTC')) base = 64000.0;
    if (pair.includes('SOL')) base = 150.0;

    const wave = Math.sin(time / 4000) * (base * 0.0015);
    const noise = (Math.random() - 0.5) * (base * 0.0004);
    const price = (base + wave + noise).toFixed(pair.includes('BTC') || pair.includes('SOL') ? 2 : 5);

    res.json({
        symbol: pair,
        price: parseFloat(price),
        bid: parseFloat((price * 0.99995).toFixed(5)),
        ask: parseFloat((price * 1.00005).toFixed(5)),
        timestamp: time
    });
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🌑 DarkAIs Algorithmic Trading Academy is LIVE!`);
    console.log(`🔗 Portal: http://localhost:${PORT}`);
    console.log(`📚 12 Comprehensive Modules, Simulators & Quizzes Active`);
    console.log(`======================================================\n`);
});
