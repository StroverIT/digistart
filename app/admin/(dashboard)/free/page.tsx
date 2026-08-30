import { GoogleFreeLeadsPanel } from "@/components/admin/google-free-leads-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLastThreeFreeTipsStageNumber } from "@/lib/emails/three-free-tips-stages";
import { listGoogleAnalysis3TipsLeadsNewestFirst } from "@/lib/server/google-analysis-3-tips-leads";
import { listGoogleFreeAnalysisLeadsNewestFirst } from "@/lib/server/google-free-analysis-leads";
import { listThreeFreeTipsSubscribersNewestFirst } from "@/lib/server/newsletter";
import type {
  GoogleAnalysis3TipsLeadRow,
  GoogleFreeAnalysisLeadRow,
  ThreeFreeTipsLeadRow,
} from "@/lib/types";

function toTipLeadRow(
  lead: Awaited<ReturnType<typeof listThreeFreeTipsSubscribersNewestFirst>>[number],
): ThreeFreeTipsLeadRow {
  return {
    id: lead.id,
    email: lead.email,
    source: lead.source,
    status: lead.status === "unsubscribed" ? "unsubscribed" : "subscribed",
    tipsEmailStage: lead.tipsEmailStage ?? 1,
    tipsLastEmailSentAt: lead.tipsLastEmailSentAt?.toISOString() ?? null,
    unsubscribedAt: lead.unsubscribedAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
  };
}

function toNamedFormLeadRow(
  lead:
    | Awaited<ReturnType<typeof listGoogleFreeAnalysisLeadsNewestFirst>>[number]
    | Awaited<ReturnType<typeof listGoogleAnalysis3TipsLeadsNewestFirst>>[number],
): GoogleFreeAnalysisLeadRow | GoogleAnalysis3TipsLeadRow {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    company: lead.company,
    googleMapsUrl: lead.googleMapsUrl,
    urgency: lead.urgency,
    status: lead.status === "done" ? "done" : "pending",
    notes: lead.notes,
    source: lead.source,
    pagePath: lead.pagePath,
    createdAt: lead.createdAt.toISOString(),
  };
}

export default async function AdminFreePage() {
  const [tipLeads, analysisLeads, analysis3TipsLeads] = await Promise.all([
    listThreeFreeTipsSubscribersNewestFirst(),
    listGoogleFreeAnalysisLeadsNewestFirst(),
    listGoogleAnalysis3TipsLeadsNewestFirst(),
  ]);

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h1 className="mb-2 text-3xl font-bold">Безплатни</h1>
        <p className="text-muted-foreground">
          Заявки от безплатните lead magnet форми по продукти
        </p>
      </div>

      <Tabs
        defaultValue="google"
        className="animate-in fade-in slide-in-from-bottom-4 space-y-4 delay-100 duration-700 fill-mode-both"
      >
        <TabsList>
          <TabsTrigger value="google">Google</TabsTrigger>
        </TabsList>

        <TabsContent value="google">
          <GoogleFreeLeadsPanel
            tipLeads={tipLeads.map(toTipLeadRow)}
            analysisLeads={analysisLeads.map(toNamedFormLeadRow)}
            analysis3TipsLeads={analysis3TipsLeads.map(toNamedFormLeadRow)}
            lastTipsEmailStage={getLastThreeFreeTipsStageNumber()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
