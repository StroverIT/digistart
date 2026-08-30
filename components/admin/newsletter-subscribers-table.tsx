"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NewsletterSubscriberRow } from "@/lib/types";

function formatBgDate(iso: string) {
  return new Date(iso).toLocaleString("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  });
}

export function NewsletterSubscribersTable({
  initialSubscribers,
}: {
  initialSubscribers: NewsletterSubscriberRow[];
}) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [pendingRemove, setPendingRemove] = useState<NewsletterSubscriberRow | null>(
    null,
  );
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    setSubscribers(initialSubscribers);
  }, [initialSubscribers]);

  async function handleRemove() {
    if (!pendingRemove) return;

    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/newsletter/${pendingRemove.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("remove failed");
      }

      setSubscribers((prev) => prev.filter((row) => row.id !== pendingRemove.id));
      toast.success(`Премахнат: ${pendingRemove.email}`);
      setPendingRemove(null);
    } catch {
      toast.error("Неуспешно премахване на абоната.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
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
                      Статус
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
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 font-mono text-sm">{row.email}</td>
                      <td className="px-4 py-3 text-sm">
                        {row.status === "unsubscribed" ? (
                          <span className="text-muted-foreground">Отписан</span>
                        ) : (
                          <span>Активен</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{row.source}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatBgDate(row.createdAt)}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">
                        {row.metadata ? JSON.stringify(row.metadata) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setPendingRemove(row)}
                          aria-label={`Премахни ${row.email}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={pendingRemove != null}
        onOpenChange={(open) => {
          if (!open && !removing) setPendingRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Премахване от бюлетина?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemove
                ? `Абонатът ${pendingRemove.email} ще бъде премахнат трайно от списъка.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Отказ</AlertDialogCancel>
            <AlertDialogAction
              disabled={removing}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                void handleRemove();
              }}
            >
              {removing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Премахване...
                </>
              ) : (
                "Премахни"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
