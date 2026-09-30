import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getConsultationBookings } from "@/lib/server/consultation-bookings";
import ConsultationsTable from "@/components/admin/ConsultationsTable";
import { AdminConsultationAvailabilityPanel } from "@/components/admin/AdminConsultationAvailabilityPanel";

export default async function ConsultationsPage() {
  const consultations = await getConsultationBookings();

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h1 className="mb-2 text-3xl font-bold">Консултации</h1>
        <p className="text-muted-foreground">
          Записи от клиенти и заключване на часове без известия
        </p>
      </div>

      <Tabs
        defaultValue="bookings"
        className="animate-in fade-in slide-in-from-bottom-4 space-y-4 delay-100 duration-700 fill-mode-both"
      >
        <TabsList>
          <TabsTrigger value="bookings">Записи</TabsTrigger>
          <TabsTrigger value="availability">Календар</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>{consultations.length} записа</CardTitle>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Няма записани консултации
                </p>
              ) : (
                <ConsultationsTable initialConsultations={consultations} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Наличност и заключвания</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminConsultationAvailabilityPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
