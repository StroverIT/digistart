"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import {
  groupEmailCatalogByCategory,
  type EmailCatalogEntry,
} from "@/lib/emails/email-catalog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmailPreview = {
  id: string;
  name: string;
  subject: string;
  html: string;
  recipients: EmailCatalogEntry["recipients"];
  trigger: string;
  sourceFile: string;
};

export function EmailsCatalogClient({
  catalog,
  adminInbox,
  fromAddress,
}: {
  catalog: EmailCatalogEntry[];
  adminInbox: string | null;
  fromAddress: string | null;
}) {
  const groups = useMemo(() => groupEmailCatalogByCategory(catalog), [catalog]);
  const [selectedId, setSelectedId] = useState(catalog[0]?.id ?? "");
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const selected = useMemo(
    () => catalog.find((entry) => entry.id === selectedId) ?? null,
    [catalog, selectedId],
  );

  const loadPreview = useCallback(async (id: string) => {
    if (!id) return;
    setLoadingPreview(true);
    try {
      const response = await fetch(
        `/api/admin/emails/preview?id=${encodeURIComponent(id)}`,
      );
      if (!response.ok) throw new Error("preview failed");
      const data = (await response.json()) as EmailPreview;
      setPreview(data);
    } catch {
      setPreview(null);
      toast.error("Неуспешно зареждане на шаблона.");
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    void loadPreview(selectedId);
  }, [loadPreview, selectedId]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <Card className="h-[min(78vh,860px)] flex flex-col overflow-hidden">
        <CardHeader className="shrink-0 border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            Шаблони
          </CardTitle>
          <CardDescription>
            {catalog.length} имейла · клик за преглед на съдържанието
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
          <div className="space-y-5 p-4">
            {groups.map((group) => (
              <div key={group.category} className="space-y-2">
                <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.categoryLabel}
                </p>
                <div className="space-y-1">
                  {group.entries.map((entry) => {
                    const isActive = entry.id === selectedId;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedId(entry.id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-transparent hover:bg-secondary",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium leading-snug">
                            {entry.name}
                          </span>
                          <div className="flex shrink-0 gap-1">
                            {entry.recipients.map((recipient) => (
                              <Badge
                                key={`${entry.id}-${recipient.role}`}
                                variant={
                                  recipient.role === "admin" ? "secondary" : "outline"
                                }
                                className="text-[10px]"
                              >
                                {recipient.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {entry.subject}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[min(78vh,860px)] flex flex-col overflow-hidden">
        <CardHeader className="shrink-0 border-b border-border space-y-3">
          <div>
            <CardTitle className="text-xl">
              {selected?.name ?? "Изберете шаблон"}
            </CardTitle>
            <CardDescription className="mt-1">
              {selected?.trigger}
            </CardDescription>
          </div>

          {selected ? (
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-secondary/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">Тема</p>
                <p className="font-medium break-words">
                  {preview?.subject ?? selected.subject}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">Изпраща се към</p>
                <ul className="mt-0.5 space-y-1">
                  {selected.recipients.map((recipient) => (
                    <li key={recipient.role} className="flex items-start gap-2">
                      <Send className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>
                        <span className="font-medium">{recipient.label}: </span>
                        <span className="text-muted-foreground">
                          {recipient.role === "admin" && adminInbox
                            ? adminInbox
                            : recipient.to}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-secondary/60 px-3 py-2 sm:col-span-2">
                <p className="text-xs text-muted-foreground">From / файл</p>
                <p className="font-mono text-xs break-all">
                  {fromAddress ?? "SMTP_FROM / DigiStart &lt;Gmail user&gt;"}
                  {" · "}
                  {selected.sourceFile}
                </p>
              </div>
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="min-h-0 flex-1 bg-muted/40 p-0">
          {loadingPreview ? (
            <div className="flex h-full min-h-[420px] items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Зареждане на шаблона…
            </div>
          ) : preview?.html ? (
            <iframe
              title={`Преглед: ${preview.name}`}
              srcDoc={preview.html}
              className="h-full min-h-[420px] w-full border-0 bg-white"
              sandbox=""
            />
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-muted-foreground">
              Няма преглед за този шаблон.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
