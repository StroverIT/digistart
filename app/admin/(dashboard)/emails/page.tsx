import { EmailsCatalogClient } from "@/components/admin/emails-catalog-client";
import { EMAIL_CATALOG } from "@/lib/emails/email-catalog";
import { siteContact } from "@/lib/site-contact";

function resolveAdminInbox(): string | null {
  return (
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.admin_email?.trim() ||
    process.env.CONSULTATION_NOTIFY_EMAIL?.trim() ||
    siteContact.email
  );
}

function resolveFromAddress(): string | null {
  const gmailUser =
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER?.trim() ||
    process.env.GOOGLE_EMAIL_USER?.trim() ||
    process.env.GMAIL_USER?.trim() ||
    process.env.SMTP_USER?.trim();

  if (process.env.SMTP_FROM?.trim()) return process.env.SMTP_FROM.trim();
  if (gmailUser) return `DigiStart <${gmailUser}>`;
  return null;
}

export default function AdminEmailsPage() {
  const adminInbox = resolveAdminInbox();
  const fromAddress = resolveFromAddress();

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h1 className="mb-2 text-3xl font-bold">Имейли</h1>
        <p className="text-muted-foreground">
          Каталог на всички транзакционни и кампанийни шаблони — кой ги получава и как
          изглеждат.
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
        <EmailsCatalogClient
          catalog={EMAIL_CATALOG}
          adminInbox={adminInbox}
          fromAddress={fromAddress}
        />
      </div>
    </div>
  );
}
