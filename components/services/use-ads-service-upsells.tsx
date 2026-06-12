"use client";

import { useCallback, useMemo, useState } from "react";
import { AdsChannelPicker } from "@/components/services/service-detail-ads-v2/AdsChannelPicker";
import { AdsExtraChannelOffer } from "@/components/services/service-detail-ads-v2/AdsExtraChannelOffer";
import {
  ADS_BASE_CHANNEL_UPSELL_ID,
  ADS_EXTRA_CHANNEL_UPSELL_ID,
  getAdsBaseChannelChoiceId,
  getAdsExtraChannelChoiceId,
  isAdsExtraChannelEnabled,
  normalizeAdsChannelUpsells,
  setAdsBaseChannelUpsell,
  setAdsExtraChannelEnabled,
  validateAdsChannelUpsells,
} from "@/lib/data/ads-channels";
import type { AdsChannelChoiceId } from "@/lib/data/ads-channels";
import type { CartItemUpsell, Service } from "@/lib/types";

interface UseAdsServiceUpsellsOptions {
  service: Service;
  upsells: CartItemUpsell[];
  onUpsellsChange: (nextUpsells: CartItemUpsell[]) => void;
  /** Render base channel picker above additional services (cart). */
  showBaseChannelInUpsells?: boolean;
}

export function useAdsServiceUpsells({
  service,
  upsells,
  onUpsellsChange,
  showBaseChannelInUpsells = false,
}: UseAdsServiceUpsellsOptions) {
  const [baseChannelError, setBaseChannelError] = useState<string | undefined>();

  const baseChannelUpsell = useMemo(
    () => service.upsells.find((upsell) => upsell.id === ADS_BASE_CHANNEL_UPSELL_ID),
    [service.upsells],
  );
  const extraChannelUpsell = useMemo(
    () => service.upsells.find((upsell) => upsell.id === ADS_EXTRA_CHANNEL_UPSELL_ID),
    [service.upsells],
  );

  const selectedBaseChannel = useMemo(() => getAdsBaseChannelChoiceId(upsells), [upsells]);
  const selectedExtraChannel = useMemo(() => getAdsExtraChannelChoiceId(upsells), [upsells]);
  const extraChannelEnabled = useMemo(() => isAdsExtraChannelEnabled(upsells), [upsells]);

  const handleUpsellsChange = useCallback(
    (nextUpsells: CartItemUpsell[]) => {
      onUpsellsChange(normalizeAdsChannelUpsells(nextUpsells));
    },
    [onUpsellsChange],
  );

  const handleBaseChannelChange = useCallback(
    (choiceId: AdsChannelChoiceId) => {
      setBaseChannelError(undefined);
      onUpsellsChange(setAdsBaseChannelUpsell(upsells, choiceId));
    },
    [onUpsellsChange, upsells],
  );

  const handleExtraChannelEnabledChange = useCallback(
    (enabled: boolean) => {
      onUpsellsChange(setAdsExtraChannelEnabled(upsells, enabled));
    },
    [onUpsellsChange, upsells],
  );

  const validateBeforeAdd = useCallback(() => {
    const error = validateAdsChannelUpsells(upsells);
    if (error?.includes("базовия пакет")) {
      setBaseChannelError(error);
    } else {
      setBaseChannelError(undefined);
    }
    return error;
  }, [upsells]);

  const baseChannelPicker =
    baseChannelUpsell ? (
      <AdsChannelPicker
        upsell={baseChannelUpsell}
        value={selectedBaseChannel}
        onChange={handleBaseChannelChange}
        label="Рекламен канал за базовия пакет"
        required
        error={baseChannelError}
      />
    ) : null;

  const customUpsellsContent =
    extraChannelUpsell ? (
      <AdsExtraChannelOffer
        upsell={extraChannelUpsell}
        enabled={extraChannelEnabled}
        autoChoiceId={selectedExtraChannel}
        baseChannelSelected={Boolean(selectedBaseChannel)}
        onEnabledChange={handleExtraChannelEnabledChange}
      />
    ) : null;

  return {
    isAdsService: true as const,
    hiddenUpsellIds: [ADS_BASE_CHANNEL_UPSELL_ID, ADS_EXTRA_CHANNEL_UPSELL_ID],
    handleUpsellsChange,
    validateBeforeAdd,
    basePackageExtra: showBaseChannelInUpsells ? undefined : baseChannelPicker,
    prefixContent: showBaseChannelInUpsells ? baseChannelPicker : undefined,
    customUpsellsContent,
  };
}
