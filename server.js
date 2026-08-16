import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Mock Forex API endpoint to feed the Botaki simulator
app.get('/api/forex/eurusd', (req, res) => {
    // Simulate EUR/USD price with a random walk around 1.1000
    const time = Date.now();
    const base = 1.1000;
    // create a realistic looking sine wave + noise
    const wave = Math.sin(time / 5000) * 0.0020;
    const noise = (Math.random() - 0.5) * 0.0005;
    const price = (base + wave + noise).toFixed(5);
    
    res.json({
        symbol: "EUR/USD",
        price: parseFloat(price),
        timestamp: time
    });
});

app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🌑 DarkAIs Academy Server is LIVE!`);
    console.log(`🔗 Access at: http://localhost:${PORT}`);
    console.log(`=========================================\n`);
});
