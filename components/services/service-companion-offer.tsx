"use client";

import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { getServiceById } from "@/lib/data/services";
import { findCartItemByService } from "@/lib/store/cart";
import type { ServiceCompanionOfferConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ServiceCompanionOfferProps {
  config: ServiceCompanionOfferConfig;
  included: boolean;
  onIncludedChange: (included: boolean) => void;
}

export function ServiceCompanionOffer({
  config,
  included,
  onIncludedChange,
}: ServiceCompanionOfferProps) {
  const companionService = getServiceById(config.serviceId);
  const companionOption = companionService?.options.find(
    (o) => o.id === config.optionId,
  );
  const alreadyInCart = Boolean(
    findCartItemByService(config.serviceId, config.optionId),
  );
  const quantity = included ? 1 : 0;
  const title = config.title ?? companionService?.name ?? config.serviceId;

  if (!companionService || !companionOption) return null;

  return (
    <div
      className={cn(
        "group rounded-lg border p-4 transition-colors",
        quantity > 0 ? "border-primary/50 bg-primary/5" : "border-border",
        alreadyInCart && "opacity-80",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Label className="font-semibold">{title}</Label>
            <Link
              href={config.learnMoreHref}
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Научи повече
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
          {alreadyInCart ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Вече е в кошницата ти — ще добавим само основната услуга от тази страница.
            </p>
          ) : null}
          <p className="text-sm mt-2">
            <Price
              value={companionOption.price}
              className="text-primary font-medium"
            />
            <span className="text-muted-foreground">
              {companionOption.isMonthly ? " /месец" : ""}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onIncludedChange(false)}
            disabled={quantity <= 0 || alreadyInCart}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center font-medium">{quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onIncludedChange(true)}
            disabled={quantity >= 1 || alreadyInCart}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {quantity > 0 && !alreadyInCart ? (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{companionOption.name}</span>
          <span className="font-medium text-primary">
            +
            <Price
              value={companionOption.price}
              className="text-primary font-medium"
            />
            {companionOption.isMonthly ? "/мес" : ""}
          </span>
        </div>
      ) : null}
    </div>
  );
}
