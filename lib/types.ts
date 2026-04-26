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
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  basePrice: number;
  isMonthly?: boolean;
  options: ServiceOption[];
  upsells: ServiceUpsell[];
  features: string[];
  timeline: string;
}

// Cart types
export interface CartItemUpsell {
  upsellId: string;
  quantity: number;
  choiceId?: string;
  entries?: string[];
  note?: string;
}

export interface CartItem {
  id: string;
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
}

export interface Cart {
  items: CartItem[];
  totalOneTime: number;
  totalMonthly: number;
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
  status: "scheduled" | "cancelled";
  orderId?: string;
  timezone?: string;
  meetUrl?: string;
}

export interface Order {
  id: string;
  cart: Cart;
  customer: CustomerInfo;
  consultation?: ConsultationBooking;
  status: "pending" | "paid" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  paymentIntentId?: string;
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
