import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null); // ✅ typed ref

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-tickers.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
          "symbols": [
    {
      "proName": "BSE:SENSEX",
      "title": "BSE SENSEX INDEX"
    },
    {
      "proName": "BSE:VEDANTASSET",
      "title": "VEDANT ASSET LIMITED"
    },
    {
      "proName": "FX_IDC:USDINR",
      "title": "USD/INR"
    }
  ],
        "colorTheme": "light",
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": false,
        "showSymbolLogo": true
      }`;
    
    // ✅ Ensure container is not null before appending
    if (container.current) {
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Quotes by TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
