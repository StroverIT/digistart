import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportChatsTable } from "@/components/admin/support-chats-table";
import { listSupportChatsForAdmin } from "@/lib/server/support-chats";
import { SUPPORT_CHAT_STATUS_OPEN } from "@/lib/support-chat/constants";

export default async function AdminSupportPage() {
  const chats = await listSupportChatsForAdmin();
  const openChats = chats.filter((c) => c.status === SUPPORT_CHAT_STATUS_OPEN);

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h1 className="text-3xl font-bold mb-2">Чат за помощ</h1>
        <p className="text-muted-foreground">
          Всички клиентски заявки и отворени разговори в реално време
        </p>
      </div>

      {openChats.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Отворени чатове ({openChats.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {openChats.map((chat) => (
                <li key={chat.id}>
                  <Link
                    href={`/admin/support/${chat.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm hover:bg-secondary/50 transition-colors"
                  >
                    <span>
                      <span className="font-medium">
                        {chat.user.name ?? chat.user.email}
                      </span>
                      <span className="text-muted-foreground"> · {chat.user.email}</span>
                    </span>
                    <span className="text-primary font-medium">Отвори чата →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
        <CardHeader>
          <CardTitle>Всички чатове ({chats.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {chats.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Все още няма заявки за помощ
            </p>
          ) : (
            <SupportChatsTable chats={chats} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
