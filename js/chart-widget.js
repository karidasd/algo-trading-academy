/* ==========================================================================
   🌑 DARKAIS ACADEMY — LIGHTWEIGHT CANVAS CANDLESTICK & TICK CHART
   ========================================================================== */

class SimpleChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.data = []; // { open, high, low, close, time } or tick numbers
        this.indicators = {}; // e.g. { sma: [] }
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = this.canvas.dataset.height || 180;
        this.render();
    }

    addTick(price, sma = null) {
        this.data.push(price);
        if (this.data.length > 50) this.data.shift();
        if (sma !== null) {
            if (!this.indicators.sma) this.indicators.sma = [];
            this.indicators.sma.push(sma);
            if (this.indicators.sma.length > 50) this.indicators.sma.shift();
        }
        this.render();
    }

    render() {
        if (!this.ctx || this.data.length < 2) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 20;

        ctx.clearRect(0, 0, w, h);

        // Calculate min/max
        let min = Math.min(...this.data);
        let max = Math.max(...this.data);
        if (this.indicators.sma && this.indicators.sma.length) {
            min = Math.min(min, ...this.indicators.sma);
            max = Math.max(max, ...this.indicators.sma);
        }
        const range = (max - min) || 0.0001;

        const getY = (val) => h - padding - ((val - min) / range) * (h - padding * 2);
        const getX = (idx) => padding + (idx / (this.data.length - 1)) * (w - padding * 2);

        // Draw grid
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        for (let i = 1; i <= 3; i++) {
            const y = (h / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(w - padding, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Draw Area & Price Line
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(this.data[0]));
        for (let i = 1; i < this.data.length; i++) {
            ctx.lineTo(getX(i), getY(this.data[i]));
        }

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
        gradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
        
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.lineTo(getX(this.data.length - 1), h - padding);
        ctx.lineTo(getX(0), h - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw SMA line if exists
        if (this.indicators.sma && this.indicators.sma.length === this.data.length) {
            ctx.beginPath();
            ctx.moveTo(getX(0), getY(this.indicators.sma[0]));
            for (let i = 1; i < this.indicators.sma.length; i++) {
                ctx.lineTo(getX(i), getY(this.indicators.sma[i]));
            }
            ctx.strokeStyle = '#FFB800';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Current Price Tag
        const lastIdx = this.data.length - 1;
        const lastPrice = this.data[lastIdx];
        const lastY = getY(lastPrice);
        const lastX = getX(lastIdx);

        ctx.fillStyle = '#00F0FF';
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
