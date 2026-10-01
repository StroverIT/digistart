export type MetaAdsProductId = "three-free-tips" | "google-analysis";

export type MetaAdsProduct = {
  id: MetaAdsProductId;
  label: string;
  landingPath: string;
  /** Default Meta campaign name for URL params + filtering. */
  defaultCampaign: string;
};

/**
 * Landing destinations we track for Meta paid ads.
 * Campaign names must match the `campaign=` URL param from Ads Manager.
 */
export const META_ADS_PRODUCTS: MetaAdsProduct[] = [
  {
    id: "google-analysis",
    label: "Google Анализ",
    landingPath: "/google/free-analysis",
    defaultCampaign: "Arno leads v2",
  },
  {
    id: "three-free-tips",
    label: "Google Three Tips",
    landingPath: "/google/three-free-tips",
    defaultCampaign: "Arno Three Free Tips",
  },
];

export const META_ADS_CAMPAIGN_MAP_SETTING_KEY = "meta_ads_product_campaigns" as const;

export type MetaAdsCampaignMap = Partial<Record<MetaAdsProductId, string>>;

export function getDefaultMetaAdsCampaignMap(): Record<MetaAdsProductId, string> {
  return Object.fromEntries(
    META_ADS_PRODUCTS.map((product) => [product.id, product.defaultCampaign]),
  ) as Record<MetaAdsProductId, string>;
}

export function getMetaAdsProduct(id: MetaAdsProductId): MetaAdsProduct {
  const product = META_ADS_PRODUCTS.find((entry) => entry.id === id);
  if (!product) throw new Error(`Unknown Meta ads product: ${id}`);
  return product;
}
