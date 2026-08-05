"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, RefreshCw } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CampaignSummary = {
  stages: Array<{ stage: number; subject: string; count: number }>;
  completedCount: number;
  eligibleTodayCount: number;
  totalTipsSubscribers: number;
};

type StagePreview = {
  stage: number;
  subject: string;
  html: string;
};

type SendResult = {
  sent: number;
  failed: number;
  skipped: number;
  error?: string;
};

export function ThreeFreeTipsCampaignPanel({
  onSent,
}: {
  onSent?: () => void;
}) {
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>("1");
  const [preview, setPreview] = useState<StagePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const response = await fetch("/api/admin/three-free-tips-campaign");
      if (!response.ok) throw new Error("load failed");
      const data = (await response.json()) as CampaignSummary;
      setSummary(data);
      if (data.stages.length > 0) {
        setSelectedStage((current) => {
          const stillValid = data.stages.some((s) => String(s.stage) === current);
          return stillValid ? current : String(data.stages[0]!.stage);
        });
      }
    } catch {
      toast.error("Неуспешно зареждане на кампанията.");
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadPreview = useCallback(async (stage: string) => {
    setLoadingPreview(true);
    try {
      const response = await fetch(
        `/api/admin/three-free-tips-campaign/preview?stage=${encodeURIComponent(stage)}`,
      );
      if (!response.ok) throw new Error("preview failed");
      const data = (await response.json()) as StagePreview;
      setPreview(data);
    } catch {
      setPreview(null);
      toast.error("Неуспешно зареждане на прегледа.");
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (!selectedStage) return;
    void loadPreview(selectedStage);
  }, [selectedStage, loadPreview]);

  const handleSend = async () => {
    setSending(true);
    try {
      const response = await fetch("/api/admin/three-free-tips-campaign/send", {
        method: "POST",
      });
      const data = (await response.json()) as SendResult;
      if (!response.ok) {
        toast.error(data.error ?? "Неуспешно изпращане.");
        return;
      }

      toast.success(
        `Изпратени: ${data.sent} · Неуспешни: ${data.failed} · Пропуснати: ${data.skipped}`,
      );
      setConfirmOpen(false);
      await loadSummary();
      onSent?.();
    } catch {
      toast.error("Неуспешно изпращане.");
    } finally {
      setSending(false);
    }
  };

  const eligible = summary?.eligibleTodayCount ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle>Имейл кампания по етапи</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ръчно изпращане според текущия етап на всеки абонат. След успешен
            имейл етапът се увеличава с 1.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadSummary()}
            disabled={loadingSummary || sending}
          >
            {loadingSummary ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Обнови
          </Button>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                disabled={sending || loadingSummary || eligible === 0}
              >
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Изпрати днешните имейли
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Изпращане на днешните имейли?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ще се изпратят имейли на {eligible}{" "}
                  {eligible === 1 ? "абонат" : "абоната"} според текущия им етап.
                  Абонати, на които вече е изпратен имейл днес, ще бъдат
                  пропуснати.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={sending}>Отказ</AlertDialogCancel>
                <AlertDialogAction
                  disabled={sending}
                  onClick={(event) => {
                    event.preventDefault();
                    void handleSend();
                  }}
                >
                  {sending ? "Изпращане..." : "Изпрати"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingSummary && !summary ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Зареждане...
          </div>
        ) : summary ? (
          <>
            <div className="flex flex-wrap gap-2">
              {summary.stages.map((stage) => (
                <div
                  key={stage.stage}
                  className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <span className="font-medium">Етап {stage.stage}</span>
                  <span className="text-muted-foreground"> · {stage.count}</span>
                </div>
              ))}
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="font-medium">Завършили</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {summary.completedCount}
                </span>
              </div>
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="font-medium">За изпращане днес</span>
                <span className="text-muted-foreground"> · {eligible}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium">Преглед на имейла</p>
                {summary.stages.length > 0 ? (
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger className="w-full sm:w-[280px]">
                      <SelectValue placeholder="Избери етап" />
                    </SelectTrigger>
                    <SelectContent>
                      {summary.stages.map((stage) => (
                        <SelectItem key={stage.stage} value={String(stage.stage)}>
                          Етап {stage.stage}: {stage.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>

              {preview ? (
                <p className="text-xs text-muted-foreground">
                  Тема: {preview.subject}
                </p>
              ) : null}

              <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
                {loadingPreview ? (
                  <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Зареждане на прегледа...
                  </div>
                ) : preview ? (
                  <iframe
                    title={`Преглед етап ${preview.stage}`}
                    srcDoc={preview.html}
                    className="h-[420px] w-full bg-white"
                    sandbox=""
                  />
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                    Няма преглед
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Няма данни за кампанията.</p>
        )}
      </CardContent>
    </Card>
  );
}
