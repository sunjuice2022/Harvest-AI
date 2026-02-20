/**
 * Hero card showing 30-day area chart for a featured commodity
 */

import React from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { Commodity } from "@agrisense/shared";
import { formatPrice } from "../../utils";
import "./TrendChartCard.css";

interface Props {
  commodity: Commodity;
  onClick: (c: Commodity) => void;
  isSelected: boolean;
}

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency: string;
}> = ({ active, payload, currency }) => {
  if (!active || !payload?.length) return null;
  return <div className="trend-tooltip">{formatPrice(payload[0].value, currency)}</div>;
};

export const TrendChartCard: React.FC<Props> = ({ commodity, onClick, isSelected }) => {
  const isUp = commodity.priceChangePct >= 0;
  const chartColor = isUp ? "var(--color-leaf-green)" : "var(--color-alert-red)";
  const tickData = commodity.priceHistory.filter((_, i) => i % 9 === 0);

  return (
    <button
      className={`trend-chart-card ${isSelected ? "trend-chart-card--selected" : ""}`}
      onClick={() => onClick(commodity)}
      aria-pressed={isSelected}
    >
      <div className="trend-chart-card__header">
        <span className="trend-chart-card__emoji">{commodity.emoji}</span>
        <div className="trend-chart-card__meta">
          <span className="trend-chart-card__name">{commodity.name}</span>
          <span className="trend-chart-card__unit">per {commodity.unit}</span>
        </div>
        <div className={`trend-chart-card__change ${isUp ? "up" : "down"}`}>
          {isUp ? "▲" : "▼"} {Math.abs(commodity.priceChangePct).toFixed(1)}%
        </div>
      </div>

      <div className="trend-chart-card__price">
        {formatPrice(commodity.currentPrice, commodity.currency)}
      </div>

      <div className="trend-chart-card__chart">
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={commodity.priceHistory}>
            <defs>
              <linearGradient id={`grad-${commodity.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              ticks={tickData.map((d) => d.date)}
              tickFormatter={(v: string) => v.slice(5)}
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip currency={commodity.currency} />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#grad-${commodity.id})`}
              dot={false}
              activeDot={{ r: 3, fill: chartColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="trend-chart-card__footer">
        <span>30d Low: {formatPrice(commodity.monthlyLow, commodity.currency)}</span>
        <span>30d High: {formatPrice(commodity.monthlyHigh, commodity.currency)}</span>
      </div>
    </button>
  );
};
