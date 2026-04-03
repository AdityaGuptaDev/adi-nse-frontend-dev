"use client";

import { useEffect, useRef } from 'react';

const TradingViewWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !containerRef.current.querySelector('.tradingview-widget-container__widget')) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": "light",
        "dateRange": "12M",
        "showChart": false,
        "locale": "in",
        "isTransparent": false,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "width": "100%",
        "height": "100%",
        "plotLineColorGrowing": "rgba(33, 150, 243, 1)",
        "plotLineColorFalling": "rgba(33, 150, 243, 1)",
        "gridLineColor": "rgba(240, 243, 250, 1)",
        "scaleFontColor": "rgba(120, 123, 134, 1)",
        "belowLineFillColorGrowing": "rgba(33, 150, 243, 0.12)",
        "belowLineFillColorFalling": "rgba(33, 150, 243, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(33, 150, 243, 0)",
        "belowLineFillColorFallingBottom": "rgba(33, 150, 243, 0)",
        "symbolActiveColor": "rgba(33, 150, 243, 0.12)",
        "tabs": [
          {
            "title": "Indices",
            "symbols": [
              { "s": "NSE:NIFTY", "d": "NIFTY 50" },
              { "s": "NSE:NIFTYBANK", "d": "NIFTY BANK" },
              { "s": "BSE:SENSEX", "d": "SENSEX" },
                { "s": "BSE:VEDANTASSET", "d": "VEDANT ASSET LIMITED" },
                  { "s": "FX_IDC:USDINR", "d": "SENSEX" }
            ]
          },
          
          
        ]
      });

      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';
      widgetContainer.style.height = '100%';
      
      const widgetDiv = document.createElement('div');
      widgetDiv.className = 'tradingview-widget-container__widget';
      widgetContainer.appendChild(widgetDiv);
      widgetContainer.appendChild(script);
      
      if (containerRef.current) {
        containerRef.current.appendChild(widgetContainer);
      }

      return () => {
        if (containerRef.current && widgetContainer.parentNode === containerRef.current) {
          containerRef.current.removeChild(widgetContainer);
        }
      };
    }
  }, []);

  return <div ref={containerRef} className="h-[400px] w-full"></div>;
};

export default TradingViewWidget;