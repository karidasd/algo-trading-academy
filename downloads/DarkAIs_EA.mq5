//+------------------------------------------------------------------+
//|                                                  DarkAIs_EA.mq5 |
//|                                  Copyright 2026, DarkAIs Academy |
//|                                      https://academy.darkais.com |
//+------------------------------------------------------------------+
#property copyright "DarkAIs Academy"
#property link      "https://academy.darkais.com"
#property version   "1.00"
#property strict

input double   InpLotSize       = 0.10;      // Fixed Lot Size
input int      InpStopLossPips  = 25;        // Stop Loss in Pips
input int      InpTakeProfitPips= 50;        // Take Profit in Pips
input int      InpSmaPeriod     = 14;        // Moving Average Period

int handleSMA;

int OnInit()
{
   Print("🌑 DarkAIs Expert Advisor Initialized successfully.");
   handleSMA = iMA(_Symbol, _Period, InpSmaPeriod, 0, MODE_SMA, PRICE_CLOSE);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   IndicatorRelease(handleSMA);
}

void OnTick()
{
   // Basic Expert Advisor Tick Handler
   MqlTick tick;
   if(!SymbolInfoTick(_Symbol, tick)) return;
   
   // Check open positions count
   if(PositionsTotal() == 0)
   {
      double sma[];
      ArraySetAsSeries(sma, true);
      CopyBuffer(handleSMA, 0, 0, 3, sma);
      
      if(tick.ask < sma[0] - (0.00020))
      {
         Print("🟢 Buying dip below SMA...");
      }
   }
}
