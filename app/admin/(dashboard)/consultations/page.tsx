import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConsultationBookings } from "@/lib/server/consultation-bookings";

export default async function ConsultationsPage() {
  const consultations = await getConsultationBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Консултации</h1>
        <p className="text-muted-foreground">Всички записани консултации и Meet връзки</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{consultations.length} записа</CardTitle>
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Няма записани консултации</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Клиент
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Дата и час
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Източник
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Статус
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Meet
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((consultation) => (
                    <tr key={consultation.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <div className="font-medium">{consultation.name}</div>
                        <div className="text-sm text-muted-foreground">{consultation.email}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {consultation.date} {consultation.time} ({consultation.timezone ?? "Europe/Sofia"})
                      </td>
                      <td className="py-3 px-4 text-sm">{consultation.source}</td>
                      <td className="py-3 px-4 text-sm">{consultation.status}</td>
                      <td className="py-3 px-4 text-sm">
                        {consultation.meetUrl ? (
                          <a
                            href={consultation.meetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                          >
                            Отвори Meet
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Няма</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
