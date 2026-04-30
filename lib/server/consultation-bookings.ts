import { google } from "googleapis";
import nodemailer from "nodemailer";
import {
  renderConsultationAdminEmailHtml,
  renderConsultationCustomerEmailHtml,
} from "@/lib/emails/consultation-emails";
import { prisma } from "@/lib/prisma";

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
  status: "scheduled" | "attended" | "absent" | "cancelled";
  orderId?: string;
  createdAt: string;
  timezone?: string;
  meetUrl?: string;
  googleEventId?: string;
}

export type ConsultationStatus = ConsultationRecord["status"];

export class GoogleMeetCreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleMeetCreationError";
  }
}

const CONSULTATION_STATUSES = new Set<ConsultationStatus>([
  "scheduled",
  "attended",
  "absent",
  "cancelled",
]);

function normalizeConsultationStatus(status: string): ConsultationStatus {
  if (CONSULTATION_STATUSES.has(status as ConsultationStatus)) {
    return status as ConsultationStatus;
  }
  return "scheduled";
}

async function transporter() {
  const gmailUser =
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER ??
    process.env.GOOGLE_EMAIL_USER ??
    process.env.GMAIL_USER ??
    process.env.SMTP_USER ??
    process.env.CONSULTATION_NOTIFY_EMAIL;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const redirectUri = process.env.REDIRECT_URI;
  if (!gmailUser || !googleClientId || !googleClientSecret || !googleRefreshToken || !redirectUri) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    redirectUri
  );
  oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: gmailUser,
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      refreshToken: googleRefreshToken,
      accessToken: accessToken.token ?? undefined,
    },
  });
}

export async function getConsultationBookings(): Promise<ConsultationRecord[]> {
  try {
    const rows = await prisma.consultationBooking.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row: (typeof rows)[number]) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company ?? undefined,
      notes: row.notes ?? undefined,
      date: row.date,
      time: row.time,
      source: row.source as ConsultationRecord["source"],
      status: normalizeConsultationStatus(row.status),
      orderId: row.orderId ?? undefined,
      createdAt: row.createdAt.toISOString(),
      timezone: row.timezone,
      meetUrl: row.meetUrl ?? undefined,
      googleEventId: row.googleEventId ?? undefined,
    }));
  } catch {
    return [];
  }
}

export async function updateConsultationBookingStatus(
  id: string,
  status: ConsultationStatus
): Promise<ConsultationRecord | null> {
  const updated = await prisma.consultationBooking.update({
    where: { id },
    data: { status },
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    company: updated.company ?? undefined,
    notes: updated.notes ?? undefined,
    date: updated.date,
    time: updated.time,
    source: updated.source as ConsultationRecord["source"],
    status: normalizeConsultationStatus(updated.status),
    orderId: updated.orderId ?? undefined,
    createdAt: updated.createdAt.toISOString(),
    timezone: updated.timezone,
    meetUrl: updated.meetUrl ?? undefined,
    googleEventId: updated.googleEventId ?? undefined,
  };
}

function resolveUtcOffsetMinutes(date: string, timezone: string): number {
  const middayUtc = new Date(`${date}T12:00:00.000Z`);
  const timezoneName = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  })
    .formatToParts(middayUtc)
    .find((part) => part.type === "timeZoneName")?.value;

  if (!timezoneName) return 0;
  if (timezoneName === "GMT" || timezoneName === "UTC") return 0;

  const offsetMatch = timezoneName.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!offsetMatch) return 0;

  const sign = offsetMatch[1] === "-" ? -1 : 1;
  const hours = Number(offsetMatch[2]);
  const minutes = Number(offsetMatch[3] ?? "0");

  return sign * (hours * 60 + minutes);
}

function buildDateInTimezone(date: string, time: string, timezone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const offsetMinutes = resolveUtcOffsetMinutes(date, timezone);
  const utcMillis = Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000;
  return new Date(utcMillis);
}

async function createGoogleMeet(booking: ConsultationRecord) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new GoogleMeetCreationError("Google Calendar credentials are not configured.");
  }

  const timezone = booking.timezone ?? "Europe/Sofia";
  const startDate = buildDateInTimezone(booking.date, booking.time, timezone);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  const attendees = [
    booking.email,
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER,
    process.env.GOOGLE_EMAIL_USER,
    process.env.CONSULTATION_NOTIFY_EMAIL,
  ]
    .filter((email): email is string => Boolean(email))
    .map((email) => ({ email }));
  const response = await calendar.events
    .insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `DigiStart consultation: ${booking.name}`,
        description: `Source: ${booking.source}\nEmail: ${booking.email}\nPhone: ${booking.phone}`,
        start: { dateTime: startDate.toISOString(), timeZone: timezone },
        end: { dateTime: endDate.toISOString(), timeZone: timezone },
        attendees,
        conferenceData: {
          createRequest: {
            requestId: `digistart-${booking.id}`,
          },
        },
      },
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : "Google Calendar event creation failed.";
      if (message.toLowerCase().includes("insufficient authentication scopes")) {
        throw new GoogleMeetCreationError(
          "Google Calendar OAuth token is missing Calendar event scopes."
        );
      }
      throw error;
    });

  const meetUrl =
    response.data.hangoutLink ??
    response.data.conferenceData?.entryPoints?.find((item) => item.entryPointType === "video")
      ?.uri;

  if (!meetUrl) {
    throw new GoogleMeetCreationError("Google Meet URL was not returned.");
  }

  return {
    eventId: response.data.id ?? undefined,
    meetUrl,
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
  };
}

async function sendConsultationEmails(booking: ConsultationRecord) {
  const senderEmail =
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER ??
    process.env.GOOGLE_EMAIL_USER ??
    process.env.GMAIL_USER ??
    process.env.SMTP_USER ??
    process.env.CONSULTATION_NOTIFY_EMAIL;
  const from =
    process.env.SMTP_FROM ?? (senderEmail ? `DigiStart <${senderEmail}>` : undefined);
  if (!from) return;

  const notifyEmail =
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER ||
    process.env.GOOGLE_EMAIL_USER ||
    process.env.CONSULTATION_NOTIFY_EMAIL ||
    "digistartbg@gmail.com";
  const mailer = await transporter();
  if (!mailer) return;
  const customerHtml = await renderConsultationCustomerEmailHtml(booking);
  const adminHtml = await renderConsultationAdminEmailHtml(booking);
  const commonText = `Консултация: ${booking.date} ${booking.time} (${booking.timezone ?? "Europe/Sofia"})\nКлиент: ${booking.name}\nТелефон: ${booking.phone}\nИзточник: ${booking.source}\nGoogle Meet: ${booking.meetUrl ?? "Ще бъде добавен допълнително"}`;

  const sendResults = await Promise.allSettled([
    mailer.sendMail({
      from,
      to: booking.email,
      subject: "Потвърждение за консултация - DigiStart",
      text: `Здравейте, ${booking.name},\n\nВашата консултация е записана.\n${commonText}`,
      html: customerHtml,
    }),
    mailer.sendMail({
      from,
      to: notifyEmail,
      subject: `Нова консултация: ${booking.name}`,
      text: `${commonText}\nИмейл: ${booking.email}\nКомпания: ${booking.company ?? "-"}`,
      html: adminHtml,
    }),
  ]);

  if (sendResults.some((result) => result.status === "rejected")) {
    throw new Error("One or more consultation emails failed to send.");
  }
}

export async function saveConsultationBooking(
  booking: ConsultationRecord
): Promise<void> {
  const meetData = await createGoogleMeet({
    ...booking,
    timezone: "Europe/Sofia",
  });
  const bookingWithMeet: ConsultationRecord = {
    ...booking,
    timezone: "Europe/Sofia",
    meetUrl: meetData.meetUrl,
    googleEventId: meetData.eventId,
  };

  await prisma.consultationBooking.upsert({
    where: { id: bookingWithMeet.id },
    create: {
      id: bookingWithMeet.id,
      name: bookingWithMeet.name,
      email: bookingWithMeet.email,
      phone: bookingWithMeet.phone,
      company: bookingWithMeet.company,
      notes: bookingWithMeet.notes,
      date: bookingWithMeet.date,
      time: bookingWithMeet.time,
      source: bookingWithMeet.source,
      status: bookingWithMeet.status,
      orderId: bookingWithMeet.orderId,
      timezone: bookingWithMeet.timezone ?? "Europe/Sofia",
      startsAt: new Date(meetData.startsAt),
      endsAt: new Date(meetData.endsAt),
      meetUrl: bookingWithMeet.meetUrl,
      googleEventId: bookingWithMeet.googleEventId,
      createdAt: new Date(bookingWithMeet.createdAt),
    },
    update: {
      status: bookingWithMeet.status,
      orderId: bookingWithMeet.orderId,
      meetUrl: bookingWithMeet.meetUrl,
      googleEventId: bookingWithMeet.googleEventId,
      startsAt: new Date(meetData.startsAt),
      endsAt: new Date(meetData.endsAt),
    },
  });

  await sendConsultationEmails({
    ...bookingWithMeet,
  }).catch(() => undefined);
}
