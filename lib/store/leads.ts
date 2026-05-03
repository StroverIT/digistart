"use client";

import { BusinessLead, LeadStatus, PurchasedService } from "@/lib/types";

const LEADS_STORAGE_KEY = "digistart_leads";

// Demo leads for testing
const demoLeads: BusinessLead[] = [
  {
    id: "lead_1",
    businessName: "Кафе Централ",
    ownerName: "Иван Петров",
    email: "ivan@kafecentral.bg",
    phone: "+359 888 123 456",
    address: "ул. Витоша 15, София",
    socialMedia: {
      facebook: "https://facebook.com/kafecentral",
      instagram: "https://instagram.com/kafecentral",
    },
    notes: "Интересуват се от онлайн магазин и социални мрежи",
    coordinates: { lat: 42.6977, lng: 23.3219 },
    status: "prospect",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "lead_2",
    businessName: "Фризьорски салон Елеганс",
    ownerName: "Мария Георгиева",
    email: "elegans@gmail.com",
    phone: "+359 899 987 654",
    address: "бул. България 45, София",
    socialMedia: {
      instagram: "https://instagram.com/elegans_salon",
    },
    coordinates: { lat: 42.6833, lng: 23.3167 },
    status: "contacted",
    contactedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "lead_3",
    businessName: "Автосервиз Мотор",
    ownerName: "Георги Димитров",
    email: "motor@abv.bg",
    phone: "+359 877 555 333",
    address: "ж.к. Люлин 5, бл. 510, София",
    socialMedia: {
      facebook: "https://facebook.com/avtoservismotor",
    },
    notes: "Имат нужда от Google Business профил",
    coordinates: { lat: 42.7167, lng: 23.25 },
    status: "accepted",
    purchasedServices: [
      {
        serviceId: "google-business",
        serviceName: "Google Business",
        optionName: "Стандартен пакет",
        price: 50,
        isMonthly: true,
        purchasedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
    ],
    contactedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    respondedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "lead_4",
    businessName: "Пицария Наполи",
    ownerName: "Антонио Росси",
    email: "napoli.pizza@gmail.com",
    phone: "+359 888 444 222",
    address: "ул. Граф Игнатиев 28, София",
    coordinates: { lat: 42.6931, lng: 23.3289 },
    status: "declined",
    notes: "Вече имат онлайн присъствие, не се интересуват в момента",
    contactedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    respondedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "lead_5",
    businessName: "Фитнес MaxPower",
    ownerName: "Стефан Колев",
    email: "info@maxpower.bg",
    phone: "+359 898 111 222",
    address: "бул. Цариградско шосе 115, София",
    socialMedia: {
      facebook: "https://facebook.com/maxpowergym",
      instagram: "https://instagram.com/maxpower_gym",
      website: "https://maxpower.bg",
    },
    coordinates: { lat: 42.6667, lng: 23.3833 },
    status: "accepted",
    purchasedServices: [
      {
        serviceId: "google-business",
        serviceName: "Google Business",
        optionName: "Профил в Google Business",
        price: 50,
        isMonthly: false,
        purchasedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        serviceId: "social-media",
        serviceName: "Социални мрежи",
        optionName: "Премиум пакет",
        price: 400,
        isMonthly: true,
        purchasedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
    ],
    contactedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    respondedAt: new Date(Date.now() - 86400000 * 35).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

// Initialize leads from localStorage or use demo data
function initializeLeads(): BusinessLead[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(LEADS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return demoLeads;
    }
  }
  
  // Initialize with demo data
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(demoLeads));
  return demoLeads;
}

// Save leads to localStorage
function saveLeads(leads: BusinessLead[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
}

// Get all leads
export function getLeads(): BusinessLead[] {
  return initializeLeads();
}

// Get lead by ID
export function getLeadById(id: string): BusinessLead | undefined {
  const leads = initializeLeads();
  return leads.find((lead) => lead.id === id);
}

// Add new lead
export function addLead(
  lead: Omit<BusinessLead, "id" | "createdAt" | "updatedAt">
): BusinessLead {
  const leads = initializeLeads();
  const newLead: BusinessLead = {
    ...lead,
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  leads.push(newLead);
  saveLeads(leads);
  return newLead;
}

// Update lead
export function updateLead(
  id: string,
  updates: Partial<Omit<BusinessLead, "id" | "createdAt">>
): BusinessLead | null {
  const leads = initializeLeads();
  const index = leads.findIndex((lead) => lead.id === id);
  
  if (index === -1) return null;
  
  leads[index] = {
    ...leads[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveLeads(leads);
  return leads[index];
}

// Update lead status
export function updateLeadStatus(
  id: string,
  status: LeadStatus
): BusinessLead | null {
  const updates: Partial<BusinessLead> = { status };
  
  if (status === "contacted") {
    updates.contactedAt = new Date().toISOString();
  } else if (status === "accepted" || status === "declined") {
    updates.respondedAt = new Date().toISOString();
  }
  
  return updateLead(id, updates);
}

// Add purchased service to lead
export function addPurchasedService(
  leadId: string,
  service: Omit<PurchasedService, "purchasedAt">
): BusinessLead | null {
  const lead = getLeadById(leadId);
  if (!lead) return null;
  
  const purchasedServices = lead.purchasedServices || [];
  purchasedServices.push({
    ...service,
    purchasedAt: new Date().toISOString(),
  });
  
  return updateLead(leadId, {
    purchasedServices,
    status: "accepted",
  });
}

// Delete lead
export function deleteLead(id: string): boolean {
  const leads = initializeLeads();
  const filtered = leads.filter((lead) => lead.id !== id);
  
  if (filtered.length === leads.length) return false;
  
  saveLeads(filtered);
  return true;
}

// Get leads by status
export function getLeadsByStatus(status: LeadStatus): BusinessLead[] {
  const leads = initializeLeads();
  return leads.filter((lead) => lead.status === status);
}

// Get lead statistics
export function getLeadStats() {
  const leads = initializeLeads();
  
  const stats = {
    total: leads.length,
    prospect: 0,
    contacted: 0,
    accepted: 0,
    declined: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  };
  
  leads.forEach((lead) => {
    stats[lead.status]++;
    
    if (lead.purchasedServices) {
      lead.purchasedServices.forEach((service) => {
        if (service.isMonthly) {
          stats.monthlyRevenue += service.price;
        } else {
          stats.totalRevenue += service.price;
        }
      });
    }
  });
  
  return stats;
}
