/**
 * Single row in the commodity list with mini sparkline
 */

import React from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import type { Commodity } from "@harvest-ai/shared";
import { formatPrice } from "../../utils";
import "./CommodityRow.css";

interface Props {
  commodity: Commodity;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const CommodityRow: React.FC<Props> = ({ commodity, isSelected, onToggle }) => {
  const isUp = commodity.priceChangePct >= 0;
  const sparkData = commodity.priceHistory.slice(-7);
  const lineColor = isUp ? "var(--color-leaf-green)" : "var(--color-alert-red)";

  return (
    <div
      className={`commodity-row ${isSelected ? "commodity-row--selected" : ""}`}
      onClick={() => onToggle(commodity.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle(commodity.id)}
      aria-expanded={isSelected}
    >
      <span className="commodity-row__emoji">{commodity.emoji}</span>

      <div className="commodity-row__info">
        <span className="commodity-row__name">{commodity.name}</span>
        <span className="commodity-row__unit">/{commodity.unit}</span>
      </div>

      <div className="commodity-row__sparkline">
        <ResponsiveContainer width="100%" height={36}>
          <LineChart data={sparkData}>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="spark-tooltip">
                    {formatPrice(payload[0].value as number, commodity.currency)}
                  </div>
                ) : null
              }
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 2.5, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="commodity-row__price-block">
        <span className="commodity-row__price">
          {formatPrice(commodity.currentPrice, commodity.currency)}
        </span>
        <span className={`commodity-row__change ${isUp ? "up" : "down"}`}>
          {isUp ? "▲" : "▼"} {Math.abs(commodity.priceChangePct).toFixed(1)}%
        </span>
      </div>

      <span className={`commodity-row__toggle ${isSelected ? "open" : ""}`}>▾</span>
    </div>
  );
};
