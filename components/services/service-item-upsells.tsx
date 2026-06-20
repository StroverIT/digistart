"use client";

import { ServiceUpsellsSection } from "@/components/services/service-upsells-section";
import { useAdsServiceUpsells } from "@/components/services/use-ads-service-upsells";
import type { CartItemUpsell, Service } from "@/lib/types";

interface ServiceItemUpsellsProps {
  service: Service;
  upsells: CartItemUpsell[];
  onUpsellsChange: (nextUpsells: CartItemUpsell[]) => void;
  collapsible?: boolean;
}

function AdsServiceItemUpsells({
  service,
  upsells,
  onUpsellsChange,
  collapsible,
}: ServiceItemUpsellsProps) {
  const adsUpsells = useAdsServiceUpsells({
    service,
    upsells,
    onUpsellsChange,
    showBaseChannelInUpsells: true,
  });

  return (
    <ServiceUpsellsSection
      service={service}
      upsells={upsells}
      onUpsellsChange={adsUpsells.handleUpsellsChange}
      hiddenUpsellIds={adsUpsells.hiddenUpsellIds}
      prefixContent={adsUpsells.prefixContent}
      collapsible={collapsible}
    />
  );
}

export function ServiceItemUpsells({
  service,
  upsells,
  onUpsellsChange,
  collapsible = false,
}: ServiceItemUpsellsProps) {
  if (service.id === "ads") {
    return (
      <AdsServiceItemUpsells
        service={service}
        upsells={upsells}
        onUpsellsChange={onUpsellsChange}
        collapsible={collapsible}
      />
    );
  }

  return (
    <ServiceUpsellsSection
      service={service}
      upsells={upsells}
      onUpsellsChange={onUpsellsChange}
      collapsible={collapsible}
    />
  );
}
