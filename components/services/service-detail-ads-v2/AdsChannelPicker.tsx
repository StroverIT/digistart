"use client";

import { cn } from "@/lib/utils";
import type { ServiceUpsell } from "@/lib/types";
import type { AdsChannelChoiceId } from "@/lib/data/ads-channels";

interface AdsChannelPickerProps {
  upsell: ServiceUpsell;
  value?: AdsChannelChoiceId;
  onChange: (choiceId: AdsChannelChoiceId) => void;
  disabledChoiceId?: AdsChannelChoiceId;
  label?: string;
  required?: boolean;
  error?: string;
}

export function AdsChannelPicker({
  upsell,
  value,
  onChange,
  disabledChoiceId,
  label = "Избери канал",
  required = false,
  error,
}: AdsChannelPickerProps) {
  const choices = upsell.choices ?? [];

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((choice) => {
          const isSelected = value === choice.id;
          const isDisabled = disabledChoiceId === choice.id;

          return (
            <button
              key={choice.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(choice.id as AdsChannelChoiceId)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-background/70 hover:border-primary/40",
                isDisabled && "cursor-not-allowed opacity-50 hover:border-border",
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
