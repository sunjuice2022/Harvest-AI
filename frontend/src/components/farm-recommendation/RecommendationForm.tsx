/**
 * RecommendationForm — collects farm conditions and triggers AI recommendation
 */

import React, { useState } from "react";
import type { FarmRecommendationRequest, FarmType, ClimateZone, Season, WaterAvailability, SoilType, BudgetLevel } from "@agrisense/shared";
import {
  FARM_TYPE_OPTIONS,
  CLIMATE_ZONE_OPTIONS,
  SEASON_OPTIONS,
  WATER_AVAILABILITY_OPTIONS,
  SOIL_TYPE_OPTIONS,
  BUDGET_LEVEL_OPTIONS,
} from "../../constants/farmRecommendation.constants";
import "./RecommendationForm.css";

interface RecommendationFormProps {
  onSubmit: (request: FarmRecommendationRequest) => void;
  isLoading: boolean;
}

const DEFAULT_FORM: FarmRecommendationRequest = {
  farmType: "mixed",
  climateZone: "tropical",
  season: "wet",
  waterAvailability: "rain-fed",
  soilType: "loamy",
  budgetLevel: "medium",
};

function SelectField({ label, id, value, options, onChange }: {
  label: string;
  id: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}): React.ReactElement {
  return (
    <div className="rec-form__field">
      <label className="rec-form__label" htmlFor={id}>{label}</label>
      <select
        id={id}
        className="rec-form__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function RecommendationForm({ onSubmit, isLoading }: RecommendationFormProps): React.ReactElement {
  const [form, setForm] = useState<FarmRecommendationRequest>(DEFAULT_FORM);

  const setField = <K extends keyof FarmRecommendationRequest>(key: K, value: FarmRecommendationRequest[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="rec-form" onSubmit={handleSubmit}>
      <SelectField label="Farm Type" id="farmType" value={form.farmType} options={FARM_TYPE_OPTIONS} onChange={(v) => setField("farmType", v as FarmType)} />
      <SelectField label="Climate Zone" id="climateZone" value={form.climateZone} options={CLIMATE_ZONE_OPTIONS} onChange={(v) => setField("climateZone", v as ClimateZone)} />
      <SelectField label="Current Season" id="season" value={form.season} options={SEASON_OPTIONS} onChange={(v) => setField("season", v as Season)} />
      <SelectField label="Water Availability" id="waterAvailability" value={form.waterAvailability} options={WATER_AVAILABILITY_OPTIONS} onChange={(v) => setField("waterAvailability", v as WaterAvailability)} />
      <SelectField label="Soil Type" id="soilType" value={form.soilType} options={SOIL_TYPE_OPTIONS} onChange={(v) => setField("soilType", v as SoilType)} />
      <SelectField label="Budget Level" id="budgetLevel" value={form.budgetLevel} options={BUDGET_LEVEL_OPTIONS} onChange={(v) => setField("budgetLevel", v as BudgetLevel)} />

      <button className="rec-form__submit" type="submit" disabled={isLoading}>
        {isLoading ? "Analysing your farm…" : "Get Recommendations →"}
      </button>
    </form>
  );
}
