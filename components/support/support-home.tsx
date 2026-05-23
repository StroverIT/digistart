"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SupportChatDto } from "@/lib/support-chat/types";

export function SupportHome() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [chats, setChats] = useState<SupportChatDto[]>([]);
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/support-chats");
      if (!res.ok) {
        setError("Неуспешно зареждане");
        return;
      }
      const data = (await res.json()) as {
        chats: SupportChatDto[];
        openChatId: string | null;
      };
      setChats(data.chats);
      setOpenChatId(data.openChatId);
    } catch {
      setError("Неуспешно зареждане");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createChat(closeExisting = false) {
    if (closeExisting && openChatId) {
      const closeRes = await fetch(`/api/support-chats/${openChatId}/close`, {
        method: "POST",
      });
      if (!closeRes.ok) {
        setError("Неуспешно затваряне на текущия чат");
        return;
      }
    }

    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/support-chats", { method: "POST" });
      const data = await res.json();
      if (res.status === 409 && data.openChatId) {
        router.push(`/user/support/${data.openChatId}`);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Неуспешно създаване");
        return;
      }
      const chatId = (data.chat as SupportChatDto).id;
      router.push(`/user/support/${chatId}`);
    } catch {
      setError("Неуспешно създаване");
    } finally {
      setCreating(false);
      setShowOpenDialog(false);
    }
  }

  function handleNewChat() {
    if (openChatId) {
      setShowOpenDialog(true);
      return;
    }
    void createChat();
  }

  const closedChats = chats.filter((c) => c.status === "closed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-7 w-7" />
          Поискай помощ
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Свържете се с наш екип в реално време. Отговор до 10 минути след първото ви
          съобщение.
        </p>
      </div>

      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Нов разговор</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {openChatId && (
              <Button asChild variant="default">
                <Link href={`/user/support/${openChatId}`}>Продължи текущия чат</Link>
              </Button>
            )}
            <Button
              type="button"
              variant={openChatId ? "outline" : "default"}
              disabled={creating || loading}
              onClick={() => handleNewChat()}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {openChatId ? "Нов чат" : "Започни чат"}
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : closedChats.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Предишни разговори</h2>
          <ul className="space-y-2">
            {closedChats.map((chat) => {
              const preview =
                chat.messages[chat.messages.length - 1]?.body ??
                "Без съобщения";
              return (
                <li key={chat.id}>
                  <Link
                    href={`/user/support/${chat.id}`}
                    className="block rounded-xl border border-border bg-card/80 px-4 py-3 text-sm hover:bg-secondary/50 transition-colors"
                  >
                    <span className="font-medium">
                      {new Date(chat.createdAt).toLocaleDateString("bg-BG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <p className="text-muted-foreground line-clamp-1 mt-1">{preview}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <AlertDialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Имате отворен чат</AlertDialogTitle>
            <AlertDialogDescription>
              Можете да продължите текущия разговор или да го затворите и да започнете нов.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href={`/user/support/${openChatId}`}>Продължи текущия</Link>
            </AlertDialogAction>
            <AlertDialogAction
              disabled={creating}
              onClick={() => void createChat(true)}
            >
              Затвори и започни нов
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
