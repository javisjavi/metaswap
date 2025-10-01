"use client";

import { useEffect, useRef } from "react";

import { useTheme } from "@/context/ThemeContext";

const DEFAULT_WIDGET_HEIGHT = 360;

const mapLocale = (locale: string) => {
  if (locale === "es") {
    return "es";
  }
  return "en";
};

type TradingViewChartProps = {
  symbol: string;
  locale: string;
};

const TradingViewChart = ({ symbol, locale }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme: theme === "light" ? "light" : "dark",
      style: "1",
      locale: mapLocale(locale),
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      studies: [],
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol, locale, theme]);

  return (
    <div className="tradingview-widget-container" style={{ width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        className="tradingview-widget-container__widget"
        style={{ width: "100%", height: DEFAULT_WIDGET_HEIGHT }}
      />
    </div>
  );
};

export default TradingViewChart;
