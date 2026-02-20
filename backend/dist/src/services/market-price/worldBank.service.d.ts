/**
 * World Bank Commodity Price API — fetches real USD prices and converts to AUD.
 * Data source: https://api.worldbank.org (public, no API key required)
 * Frequency: monthly | Cache: 24h in-memory
 */
import type { Commodity } from "@harvest-ai/shared";
interface WBPoint {
    date: string;
    value: number | null;
}
export declare const WB_COMMODITY_IDS: readonly ["wheat", "maize", "rice", "beef", "bananas", "cotton"];
export declare function fetchWorldBankData(): Promise<Map<string, WBPoint[]>>;
export declare function enrichCommodity(commodity: Commodity, wbPoints: WBPoint[]): Commodity;
export {};
//# sourceMappingURL=worldBank.service.d.ts.map