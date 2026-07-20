import { GoogleFreeLeadsPanel } from "@/components/admin/google-free-leads-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listGoogleFreeAnalysisLeadsNewestFirst } from "@/lib/server/google-free-analysis-leads";
import { listThreeFreeTipsSubscribersNewestFirst } from "@/lib/server/newsletter";
import type { GoogleFreeAnalysisLeadRow, ThreeFreeTipsLeadRow } from "@/lib/types";

function toTipLeadRow(
  lead: Awaited<ReturnType<typeof listThreeFreeTipsSubscribersNewestFirst>>[number],
): ThreeFreeTipsLeadRow {
  return {
    id: lead.id,
    email: lead.email,
    source: lead.source,
    createdAt: lead.createdAt.toISOString(),
  };
}

function toAnalysisLeadRow(
  lead: Awaited<ReturnType<typeof listGoogleFreeAnalysisLeadsNewestFirst>>[number],
): GoogleFreeAnalysisLeadRow {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    company: lead.company,
    googleMapsUrl: lead.googleMapsUrl,
    urgency: lead.urgency,
    source: lead.source,
    pagePath: lead.pagePath,
    createdAt: lead.createdAt.toISOString(),
  };
}

export default async function AdminFreePage() {
  const [tipLeads, analysisLeads] = await Promise.all([
    listThreeFreeTipsSubscribersNewestFirst(),
    listGoogleFreeAnalysisLeadsNewestFirst(),
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
            analysisLeads={analysisLeads.map(toAnalysisLeadRow)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
