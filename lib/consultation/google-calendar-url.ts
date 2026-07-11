type BuildGoogleCalendarUrlParams = {
  title: string;
  date: string;
  time: string;
  timezone: string;
  durationMinutes?: number;
  description?: string;
  location?: string;
};

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

export function buildConsultationGoogleCalendarUrl({
  title,
  date,
  time,
  timezone,
  durationMinutes = 60,
  description,
  location,
}: BuildGoogleCalendarUrlParams): string {
  const startDate = buildDateInTimezone(date, time, timezone);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  const searchParams = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatGoogleCalendarLocalDate(startDate, timezone)}/${formatGoogleCalendarLocalDate(endDate, timezone)}`,
    ctz: timezone,
  });

  if (description) searchParams.set("details", description);
  if (location) searchParams.set("location", location);

  return `https://calendar.google.com/calendar/render?${searchParams.toString()}`;
}
