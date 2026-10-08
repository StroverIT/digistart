export type TManualBookingPrefill = {
  key: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
};

export type TConsultationsAdminTab = "bookings" | "manual" | "availability";
