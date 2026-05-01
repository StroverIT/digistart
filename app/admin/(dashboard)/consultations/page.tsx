import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConsultationBookings } from "@/lib/server/consultation-bookings";
import ConsultationsTable from "@/components/admin/ConsultationsTable";

export default async function ConsultationsPage() {
  const consultations = await getConsultationBookings();

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h1 className="text-3xl font-bold mb-2">Консултации</h1>
        <p className="text-muted-foreground">Всички записани консултации и Meet връзки</p>
      </div>

      <Card className="bg-card border-border animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
        <CardHeader>
          <CardTitle>{consultations.length} записа</CardTitle>
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Няма записани консултации</p>
          ) : (
            <ConsultationsTable initialConsultations={consultations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
