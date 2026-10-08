"use client";

import type { FC } from "react";
import { useCallback, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminConsultationAvailabilityPanel } from "@/components/admin/AdminConsultationAvailabilityPanel";
import { AdminManualConsultationBookingPanel } from "@/components/admin/AdminManualConsultationBookingPanel";
import ConsultationsTable from "@/components/admin/ConsultationsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTENT, DEFAULT_TAB } from "./consts";
import type { TConsultationsAdminTab, TManualBookingPrefill } from "./types";

type TConsultationListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  date: string;
  time: string;
  source: "public" | "checkout" | "admin";
  sourcePage?: string;
  pagePath?: string;
  status: "scheduled" | "attended" | "absent" | "cancelled";
  orderId?: string;
  createdAt: string;
  timezone?: string;
  meetUrl?: string;
  googleEventId?: string;
  meetingType?: "online" | "in_person";
  address?: string;
};

type TConsultationsAdminClientProps = {
  consultations: TConsultationListItem[];
};

const normalizePhone = (phone: string) => {
  const trimmed = phone.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return undefined;
  return trimmed;
};

const buildFollowUpNotes = (consultation: TConsultationListItem) => {
  const parts: string[] = [
    `${CONTENT.followUpNotesPrefixLabel} ${consultation.date} ${consultation.time}`,
  ];
  if (consultation.company?.trim()) {
    parts.push(`Фирма/сайт: ${consultation.company.trim()}`);
  }
  if (consultation.notes?.trim()) {
    parts.push(consultation.notes.trim());
  }
  return parts.join("\n\n");
};

export const ConsultationsAdminClient: FC<TConsultationsAdminClientProps> = ({
  consultations,
}) => {
  const [activeTab, setActiveTab] = useState<TConsultationsAdminTab>(DEFAULT_TAB);
  const [manualPrefill, setManualPrefill] = useState<TManualBookingPrefill | null>(
    null,
  );

  const handleBookFollowUp = useCallback((consultation: TConsultationListItem) => {
    setManualPrefill({
      key: `${consultation.id}-${Date.now()}`,
      name: consultation.name.trim(),
      email: consultation.email.trim(),
      phone: normalizePhone(consultation.phone),
      notes: buildFollowUpNotes(consultation),
    });
    setActiveTab("manual");
  }, []);

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{CONTENT.pageTitleLabel}</h1>
            <p className="text-muted-foreground">{CONTENT.pageDescriptionLabel}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/business-meeting" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {CONTENT.businessMeetingButtonLabel}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TConsultationsAdminTab)}
        className="animate-in fade-in slide-in-from-bottom-4 space-y-4 delay-100 duration-700 fill-mode-both"
      >
        <TabsList>
          <TabsTrigger value="bookings">{CONTENT.bookingsTabLabel}</TabsTrigger>
          <TabsTrigger value="manual">{CONTENT.manualTabLabel}</TabsTrigger>
          <TabsTrigger value="availability">{CONTENT.availabilityTabLabel}</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>
                {consultations.length} {CONTENT.bookingsCardTitleSuffixLabel}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  {CONTENT.emptyBookingsLabel}
                </p>
              ) : (
                <ConsultationsTable
                  initialConsultations={consultations}
                  onBookFollowUp={handleBookFollowUp}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>{CONTENT.manualCardTitleLabel}</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminManualConsultationBookingPanel prefill={manualPrefill} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>{CONTENT.availabilityCardTitleLabel}</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminConsultationAvailabilityPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
