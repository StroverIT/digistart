// Service types
export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  isMonthly?: boolean;
}

export interface ServiceUpsell {
  id: string;
  name: string;
  description: string;
  kind?: "toggle" | "quantity" | "choice";
  unit?: string;
  pricePerUnit?: number;
  isMonthly?: boolean;
  min?: number;
  max?: number;
  default?: number;
  helperText?: string;
  includedUnits?: number;
  tierStep?: number;
  tierPrice?: number;
  /** Click-to-select choices without quantity controls (e.g. courier pickers). */
  directChoice?: boolean;
  /** Each choice has its own quantity (e.g. posts + carousels + reels). */
  multiQuantityChoice?: boolean;
  choices?: {
    id: string;
    name: string;
    description?: string;
    pricePerUnit: number;
    isMonthly?: boolean;
  }[];
  allowEntries?: boolean;
  entryLabel?: string;
  entryPlaceholder?: string;
  /** Hides the description paragraph in the buy-section configurator. */
  hideBuySectionDescription?: boolean;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  isMonthly?: boolean;
  options: ServiceOption[];
  upsells: ServiceUpsell[];
  features: string[];
  timeline: string;
}

export interface ServiceCompanionOfferConfig {
  serviceId: string;
  optionId: string;
  title?: string;
  description: string;
  learnMoreHref: string;
}

// Bundle plans & templates
export type { PlanId, SubscriptionPlan } from "@/lib/data/plans";
export type { ProductCategory, StoreTemplate } from "@/lib/data/templates";

// Cart types
export interface CartItemUpsell {
  upsellId: string;
  quantity: number;
  choiceId?: string;
  /** Per-choice quantities when the upsell uses `multiQuantityChoice`. */
  choiceQuantities?: Record<string, number>;
  entries?: string[];
  note?: string;
}

export type CartBillingCycle = "monthly" | "annual-prepaid";

export interface CartItem {
  id: string;
  /** Set for bundle subscription plans (`bundle-plan-*`). */
  planId?: string;
  serviceId: string;
  serviceName: string;
  selectedOptionId: string;
  selectedOptionName: string;
  basePrice: number;
  upsells: CartItemUpsell[];
  totalPrice: number;
  totalOneTime: number;
  totalMonthly: number;
  isMonthly?: boolean;
  billingCycle?: CartBillingCycle;
  annualPrepaySubtotal?: number;
  annualDiscountAmount?: number;
  annualDiscountRate?: number;
}

export interface Cart {
  items: CartItem[];
  totalOneTime: number;
  totalMonthly: number;
  /** Set when checkout originates from a service funnel landing page. */
  funnelId?: string;
}

// Order types
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
}

export interface ConsultationBooking {
  id: string;
  date: string;
  time: string;
  source: "public" | "checkout";
  status: "scheduled" | "attended" | "absent" | "cancelled";
  orderId?: string;
  timezone?: string;
  meetUrl?: string;
}

export interface Order {
  id: string;
  cart: Cart;
  customer: CustomerInfo;
  brandAssets?: {
    logoUrl?: string | null;
    paletteUrl?: string | null;
  };
  consultation?: ConsultationBooking;
  status: "pending" | "paid" | "in_progress" | "completed" | "cancelled";
  userId?: string | null;
  /** Only returned by API when Stripe `session_id` matches the order checkout session. */
  postCheckoutToken?: string | null;
  createdAt: string;
  updatedAt: string;
  stripe?: {
    checkoutMode?: "payment" | "subscription";
    checkoutSessionId?: string;
    paymentIntentId?: string;
    subscriptionId?: string;
    customerId?: string;
    paymentStatus?: string;
    currency?: string;
    amountSubtotal?: number;
    amountTotal?: number;
    amountTax?: number;
    metadata?: Record<string, string>;
    checkoutCompletedAt?: string;
    paidAt?: string;
  };
}

// Analytics types
export interface DailyStats {
  date: string;
  visits: number;
  orders: number;
  revenue: number;
}

export interface ServiceStats {
  serviceId: string;
  serviceName: string;
  orderCount: number;
  revenue: number;
}

export interface ServiceSlotAvailability {
  serviceId: string;
  serviceName: string;
  slug: string;
  capacity: number;
  paidCount: number;
  remaining: number;
  isSoldOut: boolean;
}

export interface ServiceWaitlistEntryRow {
  id: string;
  name: string;
  email: string;
  serviceId: string;
  serviceName: string;
  createdAt: string;
}

export interface FunnelSlotAvailability {
  funnelId: string;
  adminLabel: string;
  pagePath: string;
  serviceId: string;
  serviceName: string;
  capacity: number;
  paidCount: number;
  remaining: number;
  isSoldOut: boolean;
}

export interface DigitalRoadmapLeadRow {
  id: string;
  name: string;
  email: string;
  source: string;
  createdAt: string;
}

// Business Lead types
export type LeadStatus = "prospect" | "contacted" | "accepted" | "declined";

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface PurchasedService {
  serviceId: string;
  serviceName: string;
  optionName: string;
  price: number;
  isMonthly?: boolean;
  purchasedAt: string;
}

export interface BusinessLead {
  id: string;
  // Business info
  businessName: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  address: string;
  socialMedia?: SocialMedia;
  notes?: string;
  // Location
  coordinates: {
    lat: number;
    lng: number;
  };
  // Status & services
  status: LeadStatus;
  purchasedServices?: PurchasedService[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
  contactedAt?: string;
  respondedAt?: string;
}
