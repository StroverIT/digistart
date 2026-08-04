"use client";

import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import GoogleFreeAnalysisLeadsTable from "@/components/admin/google-free-analysis-leads-table";
import ThreeFreeTipsLeadsTable from "@/components/admin/three-free-tips-leads-table";
import { ThreeFreeTipsVideoUrlEditor } from "@/components/admin/three-free-tips-video-url-editor";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildMetaValueBasedAudienceCsv,
  downloadTextFile,
  freeAnalysisAudienceValue,
  META_AUDIENCE_LEAD_VALUES,
  splitPersonName,
  type MetaValueBasedAudienceRow,
} from "@/lib/meta-value-based-audience-csv";
import type { GoogleFreeAnalysisLeadRow, ThreeFreeTipsLeadRow } from "@/lib/types";

function exportDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function analysisAudienceRows(
  leads: GoogleFreeAnalysisLeadRow[],
): MetaValueBasedAudienceRow[] {
  return leads.map((lead) => {
    const { firstName, lastName } = splitPersonName(lead.name);
    return {
      email: lead.email,
      phone: lead.phone,
      firstName,
      lastName,
      country: "bg",
      uid: lead.id,
      value: freeAnalysisAudienceValue(lead.urgency),
    };
  });
}

function tipsAudienceRows(leads: ThreeFreeTipsLeadRow[]): MetaValueBasedAudienceRow[] {
  return leads.map((lead) => ({
    email: lead.email,
    country: "bg",
    uid: lead.id,
    value: META_AUDIENCE_LEAD_VALUES.threeFreeTips,
  }));
}

/** Prefer richer/higher-value analysis rows when the same email appears in both lists. */
function mergeAudienceRows(
  analysisRows: MetaValueBasedAudienceRow[],
  tipRows: MetaValueBasedAudienceRow[],
): MetaValueBasedAudienceRow[] {
  const byEmail = new Map<string, MetaValueBasedAudienceRow>();

  for (const row of tipRows) {
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email) continue;
    byEmail.set(email, row);
  }

  for (const row of analysisRows) {
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email) continue;
    const existing = byEmail.get(email);
    if (!existing || row.value >= existing.value) {
      byEmail.set(email, row);
    }
  }

  return Array.from(byEmail.values());
}

export function GoogleFreeLeadsPanel({
  tipLeads,
  analysisLeads,
}: {
  tipLeads: ThreeFreeTipsLeadRow[];
  analysisLeads: GoogleFreeAnalysisLeadRow[];
}) {
  const pendingAnalysisCount = analysisLeads.filter((lead) => lead.status === "pending").length;
  const totalLeadCount = tipLeads.length + analysisLeads.length;

  const exportAudience = (
    rows: MetaValueBasedAudienceRow[],
    filenamePrefix: string,
    emptyMessage: string,
    successMessage: (count: number) => string,
  ) => {
    if (rows.length === 0) {
      toast.error(emptyMessage);
      return;
    }

    downloadTextFile(
      `${filenamePrefix}-${exportDateStamp()}.csv`,
      buildMetaValueBasedAudienceCsv(rows),
    );
    toast.success(successMessage(rows.length));
  };

  const exportAnalysisAudience = () => {
    exportAudience(
      analysisAudienceRows(analysisLeads),
      "meta-value-based-audience-free-analysis",
      "Няма заявки за експорт.",
      (count) => `Експортирани ${count} заявки за анализ.`,
    );
  };

  const exportTipsAudience = () => {
    exportAudience(
      tipsAudienceRows(tipLeads),
      "meta-value-based-audience-three-free-tips",
      "Няма абонати за експорт.",
      (count) => `Експортирани ${count} абоната за 3 съвета.`,
    );
  };

  const exportCombinedAudience = () => {
    const rows = mergeAudienceRows(
      analysisAudienceRows(analysisLeads),
      tipsAudienceRows(tipLeads),
    );

    exportAudience(
      rows,
      "meta-value-based-audience-google-leads",
      "Няма данни за експорт.",
      (count) =>
        `Експортирани ${count} контакта (анализ + 3 съвета, без дублирани имейли).`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Заявки от Google lead magnet страниците
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={exportCombinedAudience}
            disabled={totalLeadCount === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Експорт всички (Meta CSV)
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/google/three-free-tips" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              3 съвета
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/google/free-analysis" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Анализ
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">
            Безплатен анализ ({pendingAnalysisCount}/{analysisLeads.length})
          </TabsTrigger>
          <TabsTrigger value="tips">
            3 безплатни съвета ({tipLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>
                {pendingAnalysisCount} чакащи · {analysisLeads.length}{" "}
                {analysisLeads.length === 1 ? "заявка" : "заявки"} общо
              </CardTitle>
              <CardAction>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={exportAnalysisAudience}
                  disabled={analysisLeads.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Meta CSV
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {analysisLeads.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Няма заявки</p>
              ) : (
                <GoogleFreeAnalysisLeadsTable initialLeads={analysisLeads} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <ThreeFreeTipsVideoUrlEditor />
          <Card>
            <CardHeader>
              <CardTitle>
                {tipLeads.length}{" "}
                {tipLeads.length === 1 ? "абонат" : "абоната"} за 3 съвета
              </CardTitle>
              <CardAction>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={exportTipsAudience}
                  disabled={tipLeads.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Meta CSV
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {tipLeads.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Няма абонати</p>
              ) : (
                <ThreeFreeTipsLeadsTable initialLeads={tipLeads} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
