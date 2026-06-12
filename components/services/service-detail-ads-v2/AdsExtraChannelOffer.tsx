"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/utils";
import type { ServiceUpsell } from "@/lib/types";
import type { AdsChannelChoiceId } from "@/lib/data/ads-channels";

interface AdsExtraChannelOfferProps {
  upsell: ServiceUpsell;
  enabled: boolean;
  autoChoiceId?: AdsChannelChoiceId;
  baseChannelSelected: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function AdsExtraChannelOffer({
  upsell,
  enabled,
  autoChoiceId,
  baseChannelSelected,
  onEnabledChange,
}: AdsExtraChannelOfferProps) {
  const autoChoice = upsell.choices?.find((choice) => choice.id === autoChoiceId);
  const price = autoChoice?.pricePerUnit ?? upsell.choices?.[0]?.pricePerUnit ?? 150;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        enabled ? "border-primary/50 bg-primary/5" : "border-border",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex-1">
          <Label className="font-semibold">{upsell.name}</Label>
          <p className="mt-1 text-sm text-muted-foreground">{upsell.description}</p>
          {upsell.helperText ? (
            <p className="mt-1 text-xs text-muted-foreground">{upsell.helperText}</p>
          ) : null}
          <p className="mt-2 text-sm">
            <Price value={price} className="font-medium text-primary" />
            <span className="text-muted-foreground"> / {upsell.unit} /мес</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEnabledChange(false)}
            disabled={!enabled}
            aria-label={`Премахни ${upsell.name}`}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center font-medium">{enabled ? 1 : 0}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEnabledChange(true)}
            disabled={enabled || !baseChannelSelected}
            aria-label={`Добави ${upsell.name}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {enabled && autoChoice ? (
        <div className="mt-3 rounded-xl border border-primary/20 bg-background/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Автоматично избран канал
          </p>
          <p className="mt-1 text-sm font-semibold">{autoChoice.name}</p>
          {autoChoice.description ? (
            <p className="mt-1 text-xs text-muted-foreground">{autoChoice.description}</p>
          ) : null}
        </div>
      ) : null}

      {!baseChannelSelected ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Първо избери канал за базовия пакет — допълнителният ще бъде другата платформа.
        </p>
      ) : null}
    </div>
  );
}
