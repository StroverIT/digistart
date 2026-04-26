import { promises as fs } from "node:fs";
import path from "node:path";

export interface ConsultationRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  date: string;
  time: string;
  source: "public" | "checkout";
  status: "scheduled" | "cancelled";
  orderId?: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_PATH = path.join(DATA_DIR, "consultation-bookings.json");

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]", "utf8");
  }
}

export async function getConsultationBookings(): Promise<ConsultationRecord[]> {
  await ensureStorage();
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ConsultationRecord[]) : [];
  } catch {
    return [];
  }
}

export async function saveConsultationBooking(
  booking: ConsultationRecord
): Promise<void> {
  const existing = await getConsultationBookings();
  existing.unshift(booking);
  await fs.writeFile(DATA_PATH, JSON.stringify(existing, null, 2), "utf8");
}
