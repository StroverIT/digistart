import { siteContact } from "@/lib/site-contact";

export const TEST_SUBJECT_PREFIX = "[TEST] ";

const DEFAULT_TEST_INBOX = siteContact.email;

export const E2E_CUSTOMER_EMAIL_DEFAULT = "emilzlatinov1234@gmail.com";

export function getE2eCustomerEmailForTests(): string {
  return process.env.E2E_CUSTOMER_EMAIL?.trim().toLowerCase() || E2E_CUSTOMER_EMAIL_DEFAULT;
}

/** Checkout / E2E addresses that should not hit real customers. */
export function isE2eCustomerEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (normalized === getE2eCustomerEmailForTests()) return true;
  return (
    normalized.endsWith("@digistart.test") ||
    normalized.includes("+e2e-") ||
    normalized.startsWith("e2e+")
  );
}

/** True when outbound mail should use [TEST] subject, body banner, and From name. */
export function isEmailTestMode(customerEmail?: string): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (process.env.EMAIL_TEST_MODE === "true" || process.env.EMAIL_TEST_MODE === "1") {
    return true;
  }
  if (customerEmail) return isE2eCustomerEmail(customerEmail);
  return false;
}

/** True when both copies should be delivered to the test inbox instead of real recipients. */
function shouldRedirectEmailsToTestInbox(customerEmail: string): boolean {
  if (process.env.EMAIL_TEST_MODE === "true" || process.env.EMAIL_TEST_MODE === "1") {
    return true;
  }
  return isE2eCustomerEmail(customerEmail);
}

export function getTestEmailInbox(): string {
  return (
    process.env.TEST_EMAIL_INBOX?.trim() ||
    process.env.E2E_CHECKOUT_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.admin_email?.trim() ||
    DEFAULT_TEST_INBOX
  );
}

export function buildE2eCheckoutEmail(scenario: string): string {
  const base = getTestEmailInbox();
  const at = base.indexOf("@");
  if (at === -1) {
    return `e2e+${scenario}+${Date.now()}@digistart.test`;
  }
  const local = base.slice(0, at);
  const domain = base.slice(at + 1);
  return `${local}+e2e-${scenario}-${Date.now()}@${domain}`;
}

export function resolveOutboundEmailDelivery(params: {
  customerEmail: string;
  adminEmail: string;
}): {
  testMode: boolean;
  customerTo: string;
  adminTo: string;
} {
  const testMode = isEmailTestMode(params.customerEmail);
  const inbox = getTestEmailInbox();

  if (shouldRedirectEmailsToTestInbox(params.customerEmail)) {
    return {
      testMode,
      customerTo: inbox,
      adminTo: inbox,
    };
  }

  return {
    testMode,
    customerTo: params.customerEmail,
    adminTo: params.adminEmail,
  };
}

export function withTestSubject(subject: string, testMode: boolean): string {
  if (!testMode) return subject;
  if (subject.startsWith(TEST_SUBJECT_PREFIX)) return subject;
  return `${TEST_SUBJECT_PREFIX}${subject}`;
}

export function withTestTextBody(
  body: string,
  testMode: boolean,
  context?: { originalTo?: string },
): string {
  if (!testMode) return body;
  const lines = [
    process.env.NODE_ENV === "development"
      ? "[TEST] Development среда - това писмо не е от production."
      : "[TEST] Това е тестово съобщение от DigiStart.",
  ];
  if (context?.originalTo) {
    lines.push(`Първоначален получател: ${context.originalTo}`);
  }
  lines.push("", "---", "");
  return `${lines.join("\n")}${body}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function withTestHtmlBody(
  html: string,
  testMode: boolean,
  context?: { originalTo?: string },
): string {
  if (!testMode) return html;

  const recipientLine = context?.originalTo
    ? `<p style="margin:8px 0 0;font-size:13px;color:#92400e"><strong>Първоначален получател:</strong> ${escapeHtml(context.originalTo)}</p>`
    : "";

  const banner = `<div style="margin:0 0 16px;padding:12px 16px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;font-family:Arial,sans-serif">
  <p style="margin:0;font-size:14px;font-weight:700;color:#92400e">[TEST] Тестово съобщение</p>
  <p style="margin:8px 0 0;font-size:13px;color:#92400e">${process.env.NODE_ENV === "development" ? "Изпратено от development среда (не production)." : "Това писмо е генерирано по време на тестване."}</p>
  ${recipientLine}
</div>`;

  return `${banner}${html}`;
}

export function withTestFrom(from: string, testMode: boolean): string {
  if (!testMode) return from;
  if (/\btest\b/i.test(from.split("<")[0] ?? from)) return from;
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) return `${match[1].trim()} TEST <${match[2]}>`;
  return `DigiStart TEST <${from}>`;
}
