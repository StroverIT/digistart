import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TargetAudiencesLeadsTable from "@/components/admin/target-audiences-leads-table";
import { TARGET_AUDIENCES_PAGE_PATH } from "@/lib/data/target-audiences-content";
import { listTargetAudienceLeadsNewestFirst } from "@/lib/server/target-audience-leads";
import type { TargetAudienceLeadRow } from "@/lib/types";

function toLeadRow(lead: Awaited<ReturnType<typeof listTargetAudienceLeadsNewestFirst>>[number]): TargetAudienceLeadRow {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    company: lead.company,
    urgency: lead.urgency,
    source: lead.source,
    pagePath: lead.pagePath,
    createdAt: lead.createdAt.toISOString(),
  };
}

export default async function TargetAudiencesAdminPage() {
  const leads = await listTargetAudienceLeadsNewestFirst();

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Целеви аудитории</h1>
            <p className="text-muted-foreground">
              Заявки от страницата за безплатен анализ на 3 потенциални аудитории
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={TARGET_AUDIENCES_PAGE_PATH} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Отвори формата
            </Link>
          </Button>
        </div>
      </div>

      <Card className="animate-in fade-in slide-in-from-bottom-4 border-border bg-card fill-mode-both delay-100 duration-700">
        <CardHeader>
          <CardTitle>{leads.length} заявки</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Няма заявки</p>
          ) : (
            <TargetAudiencesLeadsTable initialLeads={leads.map(toLeadRow)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
