"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import GoogleFreeAnalysisLeadsTable from "@/components/admin/google-free-analysis-leads-table";
import ThreeFreeTipsLeadsTable from "@/components/admin/three-free-tips-leads-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GoogleFreeAnalysisLeadRow, ThreeFreeTipsLeadRow } from "@/lib/types";

export function GoogleFreeLeadsPanel({
  tipLeads,
  analysisLeads,
}: {
  tipLeads: ThreeFreeTipsLeadRow[];
  analysisLeads: GoogleFreeAnalysisLeadRow[];
}) {
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
            Безплатен анализ ({analysisLeads.length})
          </TabsTrigger>
          <TabsTrigger value="tips">
            3 безплатни съвета ({tipLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>
                {analysisLeads.length}{" "}
                {analysisLeads.length === 1 ? "заявка" : "заявки"} за Google анализ
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

        <TabsContent value="tips">
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
                <ThreeFreeTipsLeadsTable initialLeads={tipLeads} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
