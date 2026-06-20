"use client";

import { cn } from "@/lib/utils";
import type { ServiceUpsell } from "@/lib/types";
import {
  ADS_BOTH_CHANNELS_SELECTION,
  type AdsChannelPickerValue,
} from "@/lib/data/ads-channels";

const BOTH_CHANNELS_OPTION = {
  id: ADS_BOTH_CHANNELS_SELECTION,
  name: "И двете",
  description: "Google Ads + Meta Ads",
} as const;

interface AdsChannelPickerProps {
  upsell: ServiceUpsell;
  value?: AdsChannelPickerValue;
  onChange: (value: AdsChannelPickerValue) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

export function AdsChannelPicker({
  upsell,
  value,
  onChange,
  label = "Избери канал",
  required = false,
  error,
}: AdsChannelPickerProps) {
  const choices = upsell.choices ?? [];
  const options = [...choices, BOTH_CHANNELS_OPTION];

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((choice) => {
          const isSelected = value === choice.id;

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => onChange(choice.id as AdsChannelPickerValue)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-background/70 hover:border-primary/40",
              )}
            >
              <span className="block text-sm font-semibold">{choice.name}</span>
              {choice.description ? (
                <span className="mt-1 block text-xs text-muted-foreground">{choice.description}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
