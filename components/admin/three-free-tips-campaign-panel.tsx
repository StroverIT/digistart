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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  estimateChunkDurationSeconds,
  type TipsCampaignSendConfig,
  type TipsCampaignWarmupInfo,
} from "@/config/tips-campaign-send";

type SendConfig = TipsCampaignSendConfig;

type CampaignSummary = {
  stages: Array<{ stage: number; subject: string; count: number }>;
  completedCount: number;
  eligibleTodayCount: number;
  eligibleUncappedCount: number;
  sentTodayCount: number;
  totalTipsSubscribers: number;
  warmup: TipsCampaignWarmupInfo;
  sendConfig: SendConfig;
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
  remainingEligible: number;
  rateLimited?: boolean;
  timedOut?: boolean;
  errors?: Array<{ email: string; stage: number; message: string }>;
  error?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function ThreeFreeTipsCampaignPanel({
  onSent,
  tipEmails = [],
}: {
  onSent?: () => void;
  tipEmails?: string[];
}) {
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>("1");
  const [preview, setPreview] = useState<StagePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sendProgress, setSendProgress] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState(() => tipEmails[0] ?? "");
  const [testStage, setTestStage] = useState("1");
  const [sendingTest, setSendingTest] = useState(false);

  const loadSummary = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoadingSummary(true);
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
      if (!options?.silent) toast.error("Неуспешно зареждане на кампанията.");
    } finally {
      if (!options?.silent) setLoadingSummary(false);
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
    if (!testEmail && tipEmails.length > 0) {
      setTestEmail(tipEmails[0]!);
    }
  }, [tipEmails, testEmail]);

  useEffect(() => {
    if (!selectedStage) return;
    void loadPreview(selectedStage);
  }, [selectedStage, loadPreview]);

  useEffect(() => {
    if (summary?.stages.length) {
      setTestStage((current) => {
        const stillValid = summary.stages.some((s) => String(s.stage) === current);
        return stillValid ? current : String(summary.stages[0]!.stage);
      });
    }
  }, [summary]);

  const handleSendTest = async () => {
    const email = testEmail.trim();
    const stage = Number(testStage);
    if (!email) {
      toast.error("Моля, изберете или въведете имейл.");
      return;
    }
    if (!Number.isInteger(stage) || stage < 1) {
      toast.error("Моля, изберете етап.");
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetch("/api/admin/three-free-tips-campaign/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, stage }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        subject?: string;
        error?: string;
      };

      if (!response.ok) {
        toast.error(data.error ?? "Неуспешно изпращане на тестовия имейл.");
        return;
      }

      toast.success(
        `Тестов имейл изпратен към ${email} (етап ${stage}${data.subject ? `: ${data.subject}` : ""}). Етапът на абоната не е променен.`,
      );
    } catch {
      toast.error("Неуспешно изпращане на тестовия имейл.");
    } finally {
      setSendingTest(false);
    }
  };

  const handleSend = async () => {
    const sendConfig = summary?.sendConfig;
    const sessionCap = sendConfig?.sessionCap ?? 0;
    const chunkPauseMs = sendConfig?.chunkPauseMs ?? 2000;
    const fetchTimeoutMs = sendConfig?.fetchTimeoutMs ?? 8_500;
    const startingEligible = summary?.eligibleTodayCount ?? 0;
    const pauseLabel = Math.round(chunkPauseMs / 1000);

    setSending(true);
    setSendProgress("Стартиране...");
    let totalSent = 0;
    let totalFailed = 0;
    let lastRemaining = startingEligible;
    let consecutiveEmpty = 0;
    const errorMessages: string[] = [];

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    try {
      while (true) {
        if (sessionCap > 0 && totalSent >= sessionCap) {
          toast.info(
            `Достигнат лимит за тази сесия (${sessionCap}). Натисни отново за останалите.`,
          );
          break;
        }

        let response: Response;
        try {
          response = await fetch("/api/admin/three-free-tips-campaign/send", {
            method: "POST",
            signal: AbortSignal.timeout(fetchTimeoutMs),
          });
        } catch (error) {
          const aborted =
            error instanceof DOMException &&
            (error.name === "TimeoutError" || error.name === "AbortError");
          consecutiveEmpty += 1;
          if (!aborted || consecutiveEmpty >= 3) {
            toast.error(
              aborted
                ? "Времето за изпращане изтече няколко пъти. Вече изпратените няма да се дублират — натисни отново за останалите."
                : "Неуспешно изпращане.",
            );
            await loadSummary({ silent: true });
            break;
          }
          setSendProgress(
            `Заявката изтече. Пауза ${pauseLabel}s и опит отново...`,
          );
          await sleep(chunkPauseMs);
          continue;
        }

        let data: SendResult;
        try {
          data = (await response.json()) as SendResult;
        } catch {
          consecutiveEmpty += 1;
          if (consecutiveEmpty >= 3) {
            toast.error(
              "Времето за изпращане изтече няколко пъти. Вече изпратените няма да се дублират — натисни отново за останалите.",
            );
            await loadSummary({ silent: true });
            break;
          }
          setSendProgress(
            `Няма отговор от сървъра. Пауза ${pauseLabel}s и опит отново...`,
          );
          await sleep(chunkPauseMs);
          continue;
        }

        if (!response.ok) {
          toast.error(data.error ?? "Неуспешно изпращане.");
          break;
        }

        totalSent += data.sent;
        totalFailed += data.failed;
        if (data.errors?.length) {
          errorMessages.push(
            ...data.errors.slice(0, 3).map((item) => `${item.email}: ${item.message}`),
          );
        }

        const remaining = data.remainingEligible ?? 0;
        lastRemaining = remaining;
        consecutiveEmpty = data.sent === 0 ? consecutiveEmpty + 1 : 0;
        setSendProgress(
          `Изпратени ${totalSent}${totalFailed > 0 ? ` · неуспешни ${totalFailed}` : ""} · остават ${remaining}`,
        );
        await loadSummary({ silent: true });

        if (data.rateLimited) {
          toast.error(
            "Gmail ограничи изпращането. Изчакай 30–60 мин и продължи с бутона отново.",
          );
          break;
        }

        if (remaining <= 0) break;

        if (data.sent === 0) {
          if (data.timedOut && consecutiveEmpty < 3) {
            setSendProgress(
              `Vercel timeout. Пауза ${pauseLabel}s и опит отново...`,
            );
            await sleep(chunkPauseMs);
            continue;
          }
          toast.error(
            data.timedOut
              ? "Функцията спря преди да изпрати имейл (Vercel timeout). Натисни отново след малко."
              : (errorMessages[0] ??
                "Никой имейл не беше изпратен в тази партида. Провери Gmail лимита и опитай отново след малко."),
          );
          break;
        }

        setSendProgress(
          `Пауза ${pauseLabel}s преди следващия имейл...`,
        );
        await sleep(chunkPauseMs);
      }

      if (totalSent > 0) {
        if (lastRemaining > 0) {
          toast.success(
            `Изпратени: ${totalSent} · Неуспешни: ${totalFailed}. Остават ${lastRemaining}.`,
          );
        } else {
          toast.success(`Готово. Изпратени: ${totalSent} · Неуспешни: ${totalFailed}`);
        }
      }
      setConfirmOpen(false);
      onSent?.();
    } catch {
      toast.error("Неуспешно изпращане.");
    } finally {
      window.removeEventListener("beforeunload", onBeforeUnload);
      setSending(false);
      setSendProgress(null);
    }
  };

  const eligible = summary?.eligibleTodayCount ?? 0;
  const eligibleUncapped = summary?.eligibleUncappedCount ?? eligible;
  const sentToday = summary?.sentTodayCount ?? 0;
  const warmup = summary?.warmup;
  const dailyLimit = warmup?.dailyLimit ?? 15;
  const warmupWeek = warmup?.week ?? 1;
  const campaignDay = warmup?.campaignDay ?? 0;
  const daysUntilStart = warmup?.daysUntilStart ?? 0;
  const warmupStarted = warmup?.started ?? true;
  const startDate = warmup?.startDate ?? "";
  const sendConfig = summary?.sendConfig;
  const sessionCap = sendConfig?.sessionCap ?? 0;
  const chunkSize = sendConfig?.chunkSize ?? 1;
  const delayBetweenEmailsMs = sendConfig?.delayBetweenEmailsMs ?? 0;
  const chunkPauseMs = sendConfig?.chunkPauseMs ?? 2000;
  const hasSessionCap = sessionCap > 0;
  const sessionTarget = hasSessionCap ? Math.min(eligible, sessionCap) : eligible;
  const chunkSeconds = estimateChunkDurationSeconds(chunkSize, delayBetweenEmailsMs);
  const dailyQuotaReached = sentToday >= dailyLimit;
  const baseDailyLimit = warmup?.baseDailyLimit ?? 15;
  const weeklyIncrement = warmup?.weeklyIncrement ?? 10;

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
          <AlertDialog
            open={confirmOpen}
            onOpenChange={(open) => {
              if (sending && !open) return;
              setConfirmOpen(open);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                disabled={sending || loadingSummary || eligible === 0 || !warmupStarted}
              >
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {sending
                  ? (sendProgress ?? "Изпращане...")
                  : !warmupStarted
                    ? `Старт на ${startDate} (след ${daysUntilStart} ${daysUntilStart === 1 ? "ден" : "дни"})`
                    : dailyQuotaReached
                      ? `Дневният лимит (${dailyLimit}) е достигнат`
                      : "Изпрати всички за днес"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Изпращане на днешните имейли?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <strong>Седмица {warmupWeek}</strong> — дневен лимит{" "}
                      <strong>{dailyLimit}</strong> имейла. Ще се изпратят до{" "}
                      <strong>{sessionTarget}</strong>{" "}
                      {sessionTarget === 1 ? "абонат" : "абоната"} (първо етап
                      1, после следващите). Днес вече: {sentToday}/{dailyLimit}.
                    </p>
                    <p>
                      Не затваряй и не презареждай този таб. Vercel Hobby: 1
                      имейл на заявка (лимит 10s). Пауза{" "}
                      {Math.round(chunkPauseMs / 1000)}s между заявките (~
                      {chunkSeconds}s на имейл).
                    </p>
                    {hasSessionCap && eligible > sessionCap ? (
                      <p>
                        След {sessionCap} имейла изпращането спира — натисни
                        отново за останалите.
                      </p>
                    ) : null}
                  </div>
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
                  {sending ? sendProgress ?? "Изпращане..." : "Изпрати"}
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
              {!warmupStarted ? (
                <div className="rounded-md border border-border bg-amber-500/10 px-3 py-2 text-sm">
                  <span className="font-medium">Старт {startDate}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · след {daysUntilStart} {daysUntilStart === 1 ? "ден" : "дни"}
                  </span>
                </div>
              ) : (
                <div className="rounded-md border border-border bg-primary/10 px-3 py-2 text-sm">
                  <span className="font-medium">Ден {campaignDay}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · седмица {warmupWeek} · {dailyLimit}/ден
                  </span>
                </div>
              )}
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
                <span className="font-medium">Изпратени днес</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {sentToday}/{dailyLimit}
                </span>
              </div>
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="font-medium">За изпращане днес</span>
                <span className="text-muted-foreground"> · {eligible}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Warmup от {startDate}: седмица 1 = {baseDailyLimit}/ден, после +{weeklyIncrement}{" "}
              всеки следващ седмица ({baseDailyLimit},{" "}
              {baseDailyLimit + weeklyIncrement},{" "}
              {baseDailyLimit + weeklyIncrement * 2}, …)
              {!warmupStarted
                ? ` · кампанията започва след ${daysUntilStart} ${daysUntilStart === 1 ? "ден" : "дни"}`
                : null}
              {eligibleUncapped > eligible
                ? ` · още ${eligibleUncapped - eligible} чакат след дневния лимит`
                : null}
              . Изпращаме първо етап 1, после 2, 3… — следващ етап само когато
              предишният е изчистен. Всеки абонат получава най-много един
              кампаниен имейл на ден. Vercel Hobby: 1 имейл на заявка (10s
              timeout), {Math.round(chunkPauseMs / 1000)}s пауза между
              заявките. Дръж таба отворен.
            </p>

            <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
              <div>
                <p className="text-sm font-medium">Тестов имейл</p>
                <p className="text-xs text-muted-foreground">
                  Изпраща шаблона към избран имейл без да променя етапа на абоната.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Имейл</label>
                  {tipEmails.length > 0 ? (
                    <Select
                      value={tipEmails.includes(testEmail) ? testEmail : undefined}
                      onValueChange={setTestEmail}
                      disabled={sendingTest || sending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Избери абонат" />
                      </SelectTrigger>
                      <SelectContent>
                        {tipEmails.map((email) => (
                          <SelectItem key={email} value={email}>
                            {email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(event) => setTestEmail(event.target.value)}
                    placeholder="name@email.com"
                    disabled={sendingTest || sending}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="w-full space-y-1.5 sm:w-[220px]">
                  <label className="text-xs font-medium text-muted-foreground">Етап</label>
                  <Select
                    value={testStage}
                    onValueChange={setTestStage}
                    disabled={sendingTest || sending || !summary.stages.length}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Етап" />
                    </SelectTrigger>
                    <SelectContent>
                      {summary.stages.map((stage) => (
                        <SelectItem key={stage.stage} value={String(stage.stage)}>
                          Етап {stage.stage}: {stage.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={sendingTest || sending || !testEmail.trim()}
                  onClick={() => void handleSendTest()}
                  className="sm:mb-0"
                >
                  {sendingTest ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Изпрати тест
                </Button>
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
