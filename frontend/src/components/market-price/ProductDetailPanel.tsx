/**
 * Expanded detail panel for a selected commodity
 * Shows 30-day chart, stats, and AI insight
 */

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { Commodity, MarketInsightResponse } from "@agrisense/shared";
import { formatPrice } from "../../utils";
import "./ProductDetailPanel.css";

interface Props {
  commodity: Commodity;
  insight: MarketInsightResponse | null;
  isLoadingInsight: boolean;
  insightError: string | null;
  onGetInsight: (c: Commodity) => void;
}

const RECOMMENDATION_LABELS: Record<string, { label: string; cls: string }> = {
  sell_now: { label: "SELL NOW", cls: "sell" },
  hold: { label: "HOLD", cls: "hold" },
  wait_to_buy: { label: "WAIT TO BUY", cls: "buy" },
};

const PriceTooltip: React.FC<{
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency: string;
}> = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="detail-tooltip">
      <div className="detail-tooltip__date">{label}</div>
      <div className="detail-tooltip__price">{formatPrice(payload[0].value, currency)}</div>
    </div>
  );
};

export const ProductDetailPanel: React.FC<Props> = ({
  commodity, insight, isLoadingInsight, insightError, onGetInsight,
}) => {
  const isUp = commodity.priceChangePct >= 0;
  const chartColor = isUp ? "var(--color-leaf-green)" : "var(--color-alert-red)";
  const volatility =
    commodity.monthlyHigh > 0
      ? (((commodity.monthlyHigh - commodity.monthlyLow) / commodity.monthlyHigh) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="detail-panel">
      <div className="detail-panel__chart-wrap">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={commodity.priceHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`detail-grad-${commodity.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
              tickFormatter={(v: string) => v.slice(5)}
              interval={6}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(v < 1 ? 2 : 0)
              }
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<PriceTooltip currency={commodity.currency} />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#detail-grad-${commodity.id})`}
              dot={false}
              activeDot={{ r: 4, fill: chartColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="detail-panel__stats">
        {[
          { label: "30d High", value: formatPrice(commodity.monthlyHigh, commodity.currency) },
          { label: "30d Low",  value: formatPrice(commodity.monthlyLow, commodity.currency) },
          { label: "30d Avg",  value: formatPrice(commodity.averagePrice, commodity.currency) },
          { label: "Volatility", value: `${volatility}%` },
        ].map(({ label, value }) => (
          <div key={label} className="detail-panel__stat">
            <span className="detail-panel__stat-label">{label}</span>
            <span className="detail-panel__stat-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="detail-panel__insight">
        <div className="detail-panel__insight-header">
          <span className="detail-panel__insight-title">🤖 AI Market Analysis</span>
          {!insight && !isLoadingInsight && (
            <button className="detail-panel__insight-btn" onClick={() => onGetInsight(commodity)}>
              Get AI Analysis
            </button>
          )}
        </div>

        {isLoadingInsight && (
          <div className="detail-panel__insight-loading">
            <span className="detail-panel__spinner" />
            Analysing market conditions…
          </div>
        )}

        {insightError && <div className="detail-panel__insight-error">⚠ {insightError}</div>}

        {insight && (
          <div className="detail-panel__insight-result">
            <div className="detail-panel__rec-row">
              <span className={`detail-panel__rec-badge detail-panel__rec-badge--${RECOMMENDATION_LABELS[insight.recommendation]?.cls}`}>
                {RECOMMENDATION_LABELS[insight.recommendation]?.label}
              </span>
              <span className="detail-panel__confidence">{insight.confidence}% confidence</span>
            </div>
            <p className="detail-panel__reasoning">{insight.reasoning}</p>
            <div className="detail-panel__targets">
              <span>Price target: <strong>{formatPrice(insight.priceTarget, commodity.currency)}</strong></span>
              <span>Timeframe: <strong>{insight.timeframe}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
