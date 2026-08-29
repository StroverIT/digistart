"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import GoogleFreeAnalysisLeadsTable from "@/components/admin/google-free-analysis-leads-table";
import { ThreeFreeTipsCampaignPanel } from "@/components/admin/three-free-tips-campaign-panel";
import ThreeFreeTipsLeadsTable from "@/components/admin/three-free-tips-leads-table";
import { ThreeFreeTipsVideoUrlEditor } from "@/components/admin/three-free-tips-video-url-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GOOGLE_ANALYSIS_3_TIPS_PAGE_PATH,
  GOOGLE_FREE_ANALYSIS_PAGE_PATH,
} from "@/lib/data/google-free-analysis-content";
import type {
  GoogleAnalysis3TipsLeadRow,
  GoogleFreeAnalysisLeadRow,
  ThreeFreeTipsLeadRow,
} from "@/lib/types";

export function GoogleFreeLeadsPanel({
  tipLeads,
  analysisLeads,
  analysis3TipsLeads,
  lastTipsEmailStage,
}: {
  tipLeads: ThreeFreeTipsLeadRow[];
  analysisLeads: GoogleFreeAnalysisLeadRow[];
  analysis3TipsLeads: GoogleAnalysis3TipsLeadRow[];
  lastTipsEmailStage: number;
}) {
  const router = useRouter();
  const pendingAnalysisCount = analysisLeads.filter((lead) => lead.status === "pending").length;
  const pending3TipsCount = analysis3TipsLeads.filter((lead) => lead.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Заявки от Google lead magnet страниците
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/google/three-free-tips" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              3 съвета
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={GOOGLE_ANALYSIS_3_TIPS_PAGE_PATH} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Анализ 3 съвета
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={GOOGLE_FREE_ANALYSIS_PAGE_PATH} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Анализ
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analysis-3-tips" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis-3-tips">
            Анализ 3 съвета ({pending3TipsCount}/{analysis3TipsLeads.length})
          </TabsTrigger>
          <TabsTrigger value="analysis">
            Безплатен анализ ({pendingAnalysisCount}/{analysisLeads.length})
          </TabsTrigger>
          <TabsTrigger value="tips">
            3 безплатни съвета ({tipLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis-3-tips">
          <Card>
            <CardHeader>
              <CardTitle>
                {pending3TipsCount} чакащи · {analysis3TipsLeads.length}{" "}
                {analysis3TipsLeads.length === 1 ? "заявка" : "заявки"} общо
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis3TipsLeads.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Няма заявки</p>
              ) : (
                <GoogleFreeAnalysisLeadsTable
                  initialLeads={analysis3TipsLeads}
                  apiBasePath="/api/admin/google-analysis-3-tips"
                  landingPagePath={GOOGLE_ANALYSIS_3_TIPS_PAGE_PATH}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>
                {pendingAnalysisCount} чакащи · {analysisLeads.length}{" "}
                {analysisLeads.length === 1 ? "заявка" : "заявки"} общо
              </CardTitle>
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
          <ThreeFreeTipsCampaignPanel onSent={() => router.refresh()} />
          <Card>
            <CardHeader>
              <CardTitle>
                {tipLeads.length}{" "}
                {tipLeads.length === 1 ? "абонат" : "абоната"} за 3 съвета
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tipLeads.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Няма абонати</p>
              ) : (
                <ThreeFreeTipsLeadsTable
                  initialLeads={tipLeads}
                  lastTipsEmailStage={lastTipsEmailStage}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
