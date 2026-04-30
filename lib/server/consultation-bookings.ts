import { google } from "googleapis";
import nodemailer from "nodemailer";
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
  status: "scheduled" | "cancelled";
  orderId?: string;
  createdAt: string;
  timezone?: string;
  meetUrl?: string;
  googleEventId?: string;
}

async function transporter() {
  const gmailUser =
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
      status: row.status as ConsultationRecord["status"],
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

async function createGoogleMeet(booking: ConsultationRecord) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const startDate = new Date(`${booking.date}T${booking.time}:00+03:00`);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: `DigiStart consultation: ${booking.name}`,
      description: `Source: ${booking.source}\nEmail: ${booking.email}\nPhone: ${booking.phone}`,
      start: { dateTime: startDate.toISOString(), timeZone: "Europe/Sofia" },
      end: { dateTime: endDate.toISOString(), timeZone: "Europe/Sofia" },
      attendees: [{ email: booking.email }, { email: process.env.CONSULTATION_NOTIFY_EMAIL }],
      conferenceData: {
        createRequest: {
          requestId: `digistart-${booking.id}`,
        },
      },
    },
  });

  return {
    eventId: response.data.id ?? undefined,
    meetUrl:
      response.data.hangoutLink ??
      response.data.conferenceData?.entryPoints?.find((item) => item.entryPointType === "video")
        ?.uri,
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
  };
}

async function sendConsultationEmails(booking: ConsultationRecord) {
  const from =
    process.env.SMTP_FROM ??
    (process.env.CONSULTATION_NOTIFY_EMAIL
      ? `DigiStart <${process.env.CONSULTATION_NOTIFY_EMAIL}>`
      : undefined);
  if (!from) return;

  const notifyEmail = process.env.CONSULTATION_NOTIFY_EMAIL || "digistartbg@gmail.com";
  const mailer = await transporter();
  if (!mailer) return;
  const commonText = `Консултация: ${booking.date} ${booking.time} (${booking.timezone ?? "Europe/Sofia"})\nКлиент: ${booking.name}\nТелефон: ${booking.phone}\nИзточник: ${booking.source}\nGoogle Meet: ${booking.meetUrl ?? "Ще бъде добавен допълнително"}`;

  await Promise.all([
    mailer.sendMail({
      from,
      to: booking.email,
      subject: "Потвърждение за консултация - DigiStart",
      text: `Здравейте, ${booking.name},\n\nВашата консултация е записана.\n${commonText}`,
    }),
    mailer.sendMail({
      from,
      to: notifyEmail,
      subject: `Нова консултация: ${booking.name}`,
      text: `${commonText}\nИмейл: ${booking.email}\nКомпания: ${booking.company ?? "-"}`,
    }),
  ]);
}

export async function saveConsultationBooking(
  booking: ConsultationRecord
): Promise<void> {
  const meetData = await createGoogleMeet(booking).catch(() => null);

  await prisma.consultationBooking.upsert({
    where: { id: booking.id },
    create: {
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      company: booking.company,
      notes: booking.notes,
      date: booking.date,
      time: booking.time,
      source: booking.source,
      status: booking.status,
      orderId: booking.orderId,
      timezone: "Europe/Sofia",
      startsAt: meetData?.startsAt ? new Date(meetData.startsAt) : null,
      endsAt: meetData?.endsAt ? new Date(meetData.endsAt) : null,
      meetUrl: meetData?.meetUrl,
      googleEventId: meetData?.eventId,
      createdAt: new Date(booking.createdAt),
    },
    update: {
      status: booking.status,
      orderId: booking.orderId,
      meetUrl: meetData?.meetUrl,
      googleEventId: meetData?.eventId,
      startsAt: meetData?.startsAt ? new Date(meetData.startsAt) : null,
      endsAt: meetData?.endsAt ? new Date(meetData.endsAt) : null,
    },
  });

  await sendConsultationEmails({
    ...booking,
    timezone: "Europe/Sofia",
    meetUrl: meetData?.meetUrl ?? undefined,
    googleEventId: meetData?.eventId ?? undefined,
  }).catch(() => undefined);
}
