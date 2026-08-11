import { NewsletterSubscribersTable } from "@/components/admin/newsletter-subscribers-table";
import { getNewsletterSubscribers } from "@/lib/server/newsletter";
import type { NewsletterSubscriberRow } from "@/lib/types";

export default async function AdminNewsletterPage() {
  const subscribers = await getNewsletterSubscribers();
  const rows: NewsletterSubscriberRow[] = subscribers.map((row) => ({
    id: row.id,
    email: row.email,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
    metadata: row.metadata,
  }));

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h1 className="mb-2 text-3xl font-bold">Бюлетин</h1>
        <p className="text-muted-foreground">
          Абонати от бюлетина, Google бюлетина и препоръки за ниши от страницата с шаблони
        </p>
      </div>

      <NewsletterSubscribersTable initialSubscribers={rows} />
    </div>
  );
}
