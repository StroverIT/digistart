import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNewsletterSubscribers } from "@/lib/server/newsletter";

function formatDate(d: Date) {
  return d.toLocaleString("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  });
}

export default async function AdminNewsletterPage() {
  const subscribers = await getNewsletterSubscribers();

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h1 className="mb-2 text-3xl font-bold">Бюлетин</h1>
        <p className="text-muted-foreground">
          Абонати от бюлетина и препоръки за ниши от страницата с шаблони
        </p>
      </div>

      <Card className="animate-in fade-in slide-in-from-bottom-4 border-border bg-card delay-100 duration-700 fill-mode-both">
        <CardHeader>
          <CardTitle>
            {subscribers.length}{" "}
            {subscribers.length === 1 ? "абонат" : "абоната"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Няма записани абонати</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Имейл
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Източник
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Записан на
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Метаданни
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 font-mono text-sm">{row.email}</td>
                      <td className="px-4 py-3 text-sm">{row.source}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">
                        {row.metadata ? JSON.stringify(row.metadata) : "—"}
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
