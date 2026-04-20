import React, { useEffect, useRef, memo } from 'react';

// Golden Black Theme Constants
const theme = {
  primary: "#F59E0B",
  secondary: "#FBBF24",
  accent: "#1F1A1A",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#0A0A0A",
  cardBg: "#111111",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  border: "#2A2A2A",
  gradient: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
  hoverBg: "#1F1A1A",
};

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove any existing script to avoid duplicates
    const existingScript = container.current?.querySelector('script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-tickers.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
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
      "colorTheme": "dark",
      "locale": "en",
      "largeChartUrl": "",
      "isTransparent": true,
      "showSymbolLogo": true,
      "backgroundColor": "#111111",
      "gridColor": "#2A2A2A",
      "textColor": "#F9FAFB",
      "chartBackgroundColor": "#111111",
      "fontColor": "#9CA3AF",
      "borderColor": "#2A2A2A",
      "boxBorderColor": "#2A2A2A",
      "hideSideToolbar": false,
      "allow_symbol_change": true,
      "save_image": false,
      "watchlist": [
        "BSE:SENSEX",
        "BSE:VEDANTASSET",
        "FX_IDC:USDINR"
      ],
      "details": true,
      "hotlist": true,
      "calendar": true,
      "news": ["headlines"],
      "tabs": ["overview", "financials", "analysis"],
      "showFloatingTooltip": true,
      "studies": ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"]
    });
    
    // Ensure container is not null before appending
    if (container.current) {
      container.current.appendChild(script);
    }

    // Cleanup function to remove script when component unmounts
    return () => {
      if (container.current) {
        const scriptToRemove = container.current.querySelector('script');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      }
    };
  }, []);

  return (
    <div 
      className="tradingview-widget-container rounded-xl overflow-hidden transition-all duration-300"
      ref={container}
      style={{
        background: theme.cardBg,
        borderRadius: "12px",
      }}
    >
      <div className="tradingview-widget-container__widget"></div>
      <div 
        className="tradingview-widget-copyright text-center py-2 text-xs"
        style={{
          background: theme.hoverBg,
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <a 
          href="https://www.tradingview.com/" 
          rel="noopener nofollow" 
          target="_blank"
          className="transition-all duration-300 hover:opacity-80"
          style={{ color: theme.textSecondary }}
        >
          <span className="blue-text" style={{ color: theme.primary }}>
            📊 Quotes by TradingView
          </span>
        </a>
      </div>

      {/* Add custom styles for TradingView widget */}
      <style jsx global>{`
        .tradingview-widget-container iframe {
          border-radius: 12px 12px 0 0 !important;
        }
        
        /* Override TradingView default styles to match theme */
        .tradingview-widget-container a {
          text-decoration: none !important;
        }
        
        .tradingview-widget-container .tv-widget-header {
          background: ${theme.cardBg} !important;
          border-bottom: 1px solid ${theme.border} !important;
        }
        
        .tradingview-widget-container .tv-widget-header__title {
          color: ${theme.textPrimary} !important;
        }
        
        .tradingview-widget-container .tv-widget-symbol {
          color: ${theme.textSecondary} !important;
        }
        
        .tradingview-widget-container .tv-widget-symbol__price {
          color: ${theme.primary} !important;
        }
        
        /* Loading animation */
        .tradingview-widget-container::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 3px solid ${theme.border};
          border-top-color: ${theme.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 1;
        }
        
        .tradingview-widget-container:empty::before {
          opacity: 1;
        }
        
        @keyframes spin {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        /* Scrollbar styling for TradingView iframes */
        .tradingview-widget-container ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        .tradingview-widget-container ::-webkit-scrollbar-track {
          background: ${theme.background};
        }
        
        .tradingview-widget-container ::-webkit-scrollbar-thumb {
          background: ${theme.primary};
          border-radius: 4px;
        }
        
        .tradingview-widget-container ::-webkit-scrollbar-thumb:hover {
          background: ${theme.secondary};
        }
      `}</style>
    </div>
  );
}

export default memo(TradingViewWidget);
