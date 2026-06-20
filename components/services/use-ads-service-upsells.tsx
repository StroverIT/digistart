"use client";

import { useCallback, useMemo, useState } from "react";
import { AdsChannelPicker } from "@/components/services/service-detail-ads-v2/AdsChannelPicker";
import {
  ADS_BASE_CHANNEL_UPSELL_ID,
  ADS_EXTRA_CHANNEL_UPSELL_ID,
  getAdsChannelPickerValue,
  normalizeAdsChannelUpsells,
  setAdsChannelPickerValue,
  validateAdsChannelUpsells,
} from "@/lib/data/ads-channels";
import type { AdsChannelPickerValue } from "@/lib/data/ads-channels";
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

  const selectedChannel = useMemo(() => getAdsChannelPickerValue(upsells), [upsells]);

  const handleUpsellsChange = useCallback(
    (nextUpsells: CartItemUpsell[]) => {
      onUpsellsChange(normalizeAdsChannelUpsells(nextUpsells));
    },
    [onUpsellsChange],
  );

  const handleChannelChange = useCallback(
    (value: AdsChannelPickerValue) => {
      setBaseChannelError(undefined);
      handleUpsellsChange(setAdsChannelPickerValue(upsells, value));
    },
    [handleUpsellsChange, upsells],
  );

  const validateBeforeAdd = useCallback(() => {
    const error = validateAdsChannelUpsells(upsells);
    if (error?.includes("рекламен канал")) {
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
        value={selectedChannel}
        onChange={handleChannelChange}
        label="Рекламен канал за базовия пакет"
        required
        error={baseChannelError}
      />
    ) : null;

  return {
    isAdsService: true as const,
    hiddenUpsellIds: [ADS_BASE_CHANNEL_UPSELL_ID, ADS_EXTRA_CHANNEL_UPSELL_ID],
    handleUpsellsChange,
    validateBeforeAdd,
    basePackageExtra: showBaseChannelInUpsells ? undefined : baseChannelPicker,
    prefixContent: showBaseChannelInUpsells ? baseChannelPicker : undefined,
  };
}
