export const CONSULTATION_LEAD_SUCCESS_KEY = "digistart-consultation-lead-success";

export type ConsultationLeadSuccess = {
  id: string;
  date: string;
  time: string;
  timezone: string;
  calendarUrl?: string;
  meetUrl?: string;
  meetingType?: "online" | "in_person";
};

export function readConsultationLeadSuccess(): ConsultationLeadSuccess | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(CONSULTATION_LEAD_SUCCESS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsultationLeadSuccess;
  } catch {
    return null;
  }
}

export function writeConsultationLeadSuccess(payload: ConsultationLeadSuccess) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CONSULTATION_LEAD_SUCCESS_KEY, JSON.stringify(payload));
}

export function formatConsultationDisplayDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("bg-BG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
