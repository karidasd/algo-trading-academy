"""
🌑 DarkAIs Algorithmic Trading Bot Starter Kit (Python Edition)
Strategy: Dynamic Mean Reversion & Multi-Level Take Profit
"""

import time
import math

class DarkAIsForexBot:
    def __init__(self, symbol="EURUSD", balance=10000.0, risk_pct=1.0):
        self.symbol = symbol
        self.balance = balance
        self.risk_pct = risk_pct
        self.history = []
        self.position = None

    def on_tick(self, price):
        self.history.append(price)
        if len(self.history) > 50:
            self.history.pop(0)

        print(f"[{time.strftime('%X')}] {self.symbol} Tick: {price:.5f}")

        if len(self.history) < 10:
            return

        sma = sum(self.history[-10:]) / 10.0
        
        # Position Management
        if self.position:
            self.manage_position(price)
        else:
            self.check_entry(price, sma)

    def check_entry(self, price, sma):
        deviation = price - sma
        if deviation < -0.00020:
            lot_size = self.calculate_lot_size(sl_pips=20)
            self.position = {"type": "BUY", "entry": price, "lot": lot_size}
            print(f"🟢 [ENTRY] BUY {lot_size} Lots @ {price:.5f} (Below SMA: {sma:.5f})")
        elif deviation > 0.00020:
            lot_size = self.calculate_lot_size(sl_pips=20)
            self.position = {"type": "SELL", "entry": price, "lot": lot_size}
            print(f"🔴 [ENTRY] SELL {lot_size} Lots @ {price:.5f} (Above SMA: {sma:.5f})")

    def manage_position(self, current_price):
        entry = self.position["entry"]
        is_buy = self.position["type"] == "BUY"
        pnl = (current_price - entry if is_buy else entry - current_price) * 100000 * self.position["lot"]

        # Close on Target Profit ($150) or Hard Stop Loss (-$100)
        if pnl >= 150.0 or pnl <= -100.0:
            self.balance += pnl
            print(f"🎯 [CLOSE] Position Closed @ {current_price:.5f} | Net PnL: ${pnl:+.2f} | Balance: ${self.balance:,.2f}")
            self.position = None

    def calculate_lot_size(self, sl_pips=20):
        risk_usd = self.balance * (self.risk_pct / 100.0)
        raw_lot = risk_usd / (sl_pips * 10.0)
        return max(0.01, round(raw_lot, 2))

if __name__ == "__main__":
    print("🌑 DarkAIs Python Bot Initialized. Starting Tick Loop...")
    bot = DarkAIsForexBot()
    # Simulated tick test
    test_prices = [1.0850, 1.0848, 1.0845, 1.0840, 1.0835, 1.0838, 1.0845, 1.0855, 1.0865, 1.0870]
    for p in test_prices:
        bot.on_tick(p)
        time.sleep(0.5)
