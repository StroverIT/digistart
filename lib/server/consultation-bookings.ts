import { google } from "googleapis";
import nodemailer from "nodemailer";
import {
  renderConsultationAdminEmailHtml,
  renderConsultationCustomerEmailHtml,
} from "@/lib/emails/consultation-emails";
import { prisma } from "@/lib/prisma";
import {
  resolveOutboundEmailDelivery,
  withTestFrom,
  withTestHtmlBody,
  withTestSubject,
  withTestTextBody,
} from "@/lib/server/email-test";

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
  sourcePage?: string;
  status: "scheduled" | "attended" | "absent" | "cancelled";
  orderId?: string;
  meetingType?: "online" | "in_person";
  address?: string;
  createdAt: string;
  timezone?: string;
  meetUrl?: string;
  googleEventId?: string;
  calendarUrl?: string;
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
      meetingType: (row.meetingType as ConsultationRecord["meetingType"]) ?? "online",
      address: row.address ?? undefined,
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
    meetingType: (updated.meetingType as ConsultationRecord["meetingType"]) ?? "online",
    address: updated.address ?? undefined,
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

function formatGoogleCalendarLocalDate(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${get("year")}${get("month")}${get("day")}T${get("hour")}${get("minute")}${get("second")}`;
}

function buildGoogleCalendarUrl(params: {
  title: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  description?: string;
  location?: string;
}): string {
  const searchParams = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates: `${formatGoogleCalendarLocalDate(params.startDate, params.timezone)}/${formatGoogleCalendarLocalDate(params.endDate, params.timezone)}`,
    ctz: params.timezone,
  });
  if (params.description) searchParams.set("details", params.description);
  if (params.location) searchParams.set("location", params.location);

  return `https://calendar.google.com/calendar/render?${searchParams.toString()}`;
}

async function createCalendarEvent(booking: ConsultationRecord) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new GoogleMeetCreationError("Google Calendar credentials are not configured.");
  }

  const isInPerson = booking.meetingType === "in_person";
  const timezone = booking.timezone ?? "Europe/Sofia";
  const startDate = buildDateInTimezone(booking.date, booking.time, timezone);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  const attendees = [
    booking.email,
    process.env.ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER,
    process.env.GOOGLE_EMAIL_USER,
    process.env.CONSULTATION_NOTIFY_EMAIL,
  ]
    .filter((email): email is string => Boolean(email))
    .filter((email, index, list) => list.indexOf(email) === index)
    .map((email) => ({ email }));

  const locationLine = isInPerson && booking.address ? `\nАдрес: ${booking.address}` : "";
  const notesLine = booking.notes?.trim() ? `\nБележки: ${booking.notes.trim()}` : "";
  const meetingLine = isInPerson ? "На място в София" : "Онлайн (Google Meet)";

  const response = await calendar.events
    .insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      sendUpdates: "all",
      conferenceDataVersion: isInPerson ? undefined : 1,
      requestBody: {
        summary: `DigiStart consultation: ${booking.name}`,
        description: `Формат: ${meetingLine}\nSource: ${booking.sourcePage ?? booking.source}\nEmail: ${booking.email}\nPhone: ${booking.phone}${locationLine}${notesLine}`,
        location: isInPerson ? booking.address : undefined,
        start: { dateTime: startDate.toISOString(), timeZone: timezone },
        end: { dateTime: endDate.toISOString(), timeZone: timezone },
        attendees,
        conferenceData: isInPerson
          ? undefined
          : {
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

  const meetUrl = isInPerson
    ? undefined
    : response.data.hangoutLink ??
    response.data.conferenceData?.entryPoints?.find((item) => item.entryPointType === "video")
      ?.uri;

  if (!isInPerson && !meetUrl) {
    throw new GoogleMeetCreationError("Google Meet URL was not returned.");
  }

  const calendarUrl =
    response.data.htmlLink ??
    buildGoogleCalendarUrl({
      title: `DigiStart consultation: ${booking.name}`,
      startDate,
      endDate,
      timezone,
      description: `Формат: ${meetingLine}\nSource: ${booking.sourcePage ?? booking.source}\nEmail: ${booking.email}\nPhone: ${booking.phone}${locationLine}${notesLine}`,
      location: isInPerson ? booking.address : undefined,
    });

  return {
    eventId: response.data.id ?? undefined,
    meetUrl,
    calendarUrl,
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
    process.env.ADMIN_EMAIL ??
    process.env.admin_email ??
    process.env.CONSULTATION_NOTIFY_EMAIL ??
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER ??
    process.env.GOOGLE_EMAIL_USER ??
    "digistartbg@gmail.com";
  const mailer = await transporter();
  if (!mailer) return;
  const customerHtml = await renderConsultationCustomerEmailHtml(booking);
  const adminHtml = await renderConsultationAdminEmailHtml(booking);
  const calendarLine = booking.calendarUrl
    ? `Google Calendar (${booking.date} ${booking.time}): ${booking.calendarUrl}`
    : `Google Calendar: ${booking.date} ${booking.time}`;
  const notesLine = booking.notes?.trim() ? `\nБележки: ${booking.notes.trim()}` : "";
  const commonText =
    booking.meetingType === "in_person"
      ? `Консултация: ${booking.date} ${booking.time} (${booking.timezone ?? "Europe/Sofia"})\nКлиент: ${booking.name}\nТелефон: ${booking.phone}\nИзточник: ${booking.sourcePage ?? booking.source}\nФормат: На място в София${booking.address ? ` — ${booking.address}` : ""}${notesLine}\n${calendarLine}`
      : `Консултация: ${booking.date} ${booking.time} (${booking.timezone ?? "Europe/Sofia"})\nКлиент: ${booking.name}\nТелефон: ${booking.phone}\nИзточник: ${booking.sourcePage ?? booking.source}\nФормат: Онлайн\nGoogle Meet: ${booking.meetUrl ?? "Ще бъде добавен допълнително"}${notesLine}\n${calendarLine}`;

  const delivery = resolveOutboundEmailDelivery({
    customerEmail: booking.email,
    adminEmail: notifyEmail,
  });
  const mailFrom = withTestFrom(from, delivery.testMode);
  const customerSubject = withTestSubject(
    "Потвърждение за консултация - DigiStart",
    delivery.testMode,
  );
  const adminSubject = withTestSubject(`Нова консултация: ${booking.name}`, delivery.testMode);

  const sendResults = await Promise.allSettled([
    mailer.sendMail({
      from: mailFrom,
      to: delivery.customerTo,
      subject: customerSubject,
      text: withTestTextBody(
        `Здравейте, ${booking.name},\n\nВашата консултация е записана.\n${commonText}`,
        delivery.testMode,
        { originalTo: booking.email },
      ),
      html: withTestHtmlBody(customerHtml, delivery.testMode, { originalTo: booking.email }),
    }),
    mailer.sendMail({
      from: mailFrom,
      to: delivery.adminTo,
      subject: adminSubject,
      text: withTestTextBody(
        `${commonText}\nИмейл: ${booking.email}\nКомпания: ${booking.company ?? "-"}`,
        delivery.testMode,
        { originalTo: notifyEmail },
      ),
      html: withTestHtmlBody(adminHtml, delivery.testMode, { originalTo: notifyEmail }),
    }),
  ]);

  if (sendResults.some((result) => result.status === "rejected")) {
    throw new Error("One or more consultation emails failed to send.");
  }
}

export async function saveConsultationBooking(
  booking: ConsultationRecord
): Promise<void> {
  const meetingType = booking.meetingType ?? "online";
  const calendarData = await createCalendarEvent({
    ...booking,
    meetingType,
    timezone: "Europe/Sofia",
  });
  const bookingWithMeet: ConsultationRecord = {
    ...booking,
    meetingType,
    timezone: "Europe/Sofia",
    meetUrl: calendarData.meetUrl ?? undefined,
    googleEventId: calendarData.eventId,
    calendarUrl: calendarData.calendarUrl,
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
      meetingType: bookingWithMeet.meetingType ?? "online",
      address: bookingWithMeet.address,
      timezone: bookingWithMeet.timezone ?? "Europe/Sofia",
      startsAt: new Date(calendarData.startsAt),
      endsAt: new Date(calendarData.endsAt),
      meetUrl: bookingWithMeet.meetUrl,
      googleEventId: bookingWithMeet.googleEventId,
      createdAt: new Date(bookingWithMeet.createdAt),
    },
    update: {
      status: bookingWithMeet.status,
      orderId: bookingWithMeet.orderId,
      meetingType: bookingWithMeet.meetingType ?? "online",
      address: bookingWithMeet.address,
      meetUrl: bookingWithMeet.meetUrl,
      googleEventId: bookingWithMeet.googleEventId,
      startsAt: new Date(calendarData.startsAt),
      endsAt: new Date(calendarData.endsAt),
    },
  });

  await sendConsultationEmails({
    ...bookingWithMeet,
  }).catch(() => undefined);
}
