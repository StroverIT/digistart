"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ServiceSlotAvailability, ServiceWaitlistEntryRow } from "@/lib/types";

function formatBgDate(iso: string) {
  return new Date(iso).toLocaleString("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ServiceSlotsPanel() {
  const [availabilities, setAvailabilities] = useState<ServiceSlotAvailability[]>([]);
  const [waitlist, setWaitlist] = useState<ServiceWaitlistEntryRow[]>([]);
  const [draftCapacity, setDraftCapacity] = useState<Record<string, string>>({});
  const [draftAdjustment, setDraftAdjustment] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [slotsRes, waitlistRes] = await Promise.all([
        fetch("/api/admin/service-slots"),
        fetch("/api/admin/service-waitlist"),
      ]);
      if (!slotsRes.ok || !waitlistRes.ok) {
        throw new Error("load failed");
      }
      const slotsData = (await slotsRes.json()) as { availabilities: ServiceSlotAvailability[] };
      const waitlistData = (await waitlistRes.json()) as { entries: ServiceWaitlistEntryRow[] };
      setAvailabilities(slotsData.availabilities ?? []);
      setWaitlist(waitlistData.entries ?? []);
      const cap: Record<string, string> = {};
      const adj: Record<string, string> = {};
      for (const row of slotsData.availabilities ?? []) {
        cap[row.serviceId] = String(row.capacity);
        adj[row.serviceId] = String(row.adjustment);
      }
      setDraftCapacity(cap);
      setDraftAdjustment(adj);
    } catch {
      toast.error("Неуспешно зареждане на местата и waitlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (serviceId: string) => {
    const slotCapacity = Number.parseInt(draftCapacity[serviceId] ?? "", 10);
    const slotAdjustment = Number.parseInt(draftAdjustment[serviceId] ?? "", 10);
    if (Number.isNaN(slotCapacity) || slotCapacity < 0) {
      toast.error("Капацитетът трябва да е цяло число ≥ 0.");
      return;
    }
    if (Number.isNaN(slotAdjustment)) {
      toast.error("Корекцията трябва да е цяло число.");
      return;
    }

    setSavingId(serviceId);
    try {
      const response = await fetch("/api/admin/service-slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, slotCapacity, slotAdjustment }),
      });
      const data = (await response.json()) as {
        availability?: ServiceSlotAvailability;
        error?: string;
      };
      if (!response.ok) {
        toast.error(data.error ?? "Неуспешно записване.");
        return;
      }
      if (data.availability) {
        setAvailabilities((prev) =>
          prev.map((row) =>
            row.serviceId === serviceId ? data.availability! : row,
          ),
        );
      }
      toast.success("Настройките са запазени.");
    } catch {
      toast.error("Неуспешно записване.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card data-admin-animate className="bg-card border-border opacity-0 translate-y-10">
        <CardHeader>
          <CardTitle>Свободни места по услуга</CardTitle>
          <p className="text-sm text-muted-foreground">
            Оставащи = капацитет + ръчна корекция − платени покупки (само успешно платени
            Stripe поръчки).
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Зареждане...</p>
          ) : availabilities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Няма конфигурирани услуги.</p>
          ) : (
            <div className="space-y-4">
              {availabilities.map((row) => (
                <div
                  key={row.serviceId}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{row.serviceName}</p>
                    <p className="text-sm">
                      Оставащи:{" "}
                      <span className="font-bold text-primary tabular-nums">
                        {row.remaining}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        (платени: {row.paidCount})
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`cap-${row.serviceId}`}>Капацитет</Label>
                      <Input
                        id={`cap-${row.serviceId}`}
                        type="number"
                        min={0}
                        value={draftCapacity[row.serviceId] ?? ""}
                        onChange={(e) =>
                          setDraftCapacity((prev) => ({
                            ...prev,
                            [row.serviceId]: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`adj-${row.serviceId}`}>Ръчна корекция</Label>
                      <Input
                        id={`adj-${row.serviceId}`}
                        type="number"
                        value={draftAdjustment[row.serviceId] ?? ""}
                        onChange={(e) =>
                          setDraftAdjustment((prev) => ({
                            ...prev,
                            [row.serviceId]: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        className="w-full"
                        onClick={() => void handleSave(row.serviceId)}
                        disabled={savingId === row.serviceId}
                      >
                        {savingId === row.serviceId ? "Запис..." : "Запази"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-admin-animate className="bg-card border-border opacity-0 translate-y-10">
        <CardHeader>
          <CardTitle>Waitlist</CardTitle>
          <p className="text-sm text-muted-foreground">
            Подредени по най-скоро записани.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Зареждане...</p>
          ) : waitlist.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Няма записи в waitlist
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Име
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Имейл
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Записан на
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Услуга
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((entry) => (
                    <tr key={entry.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-medium">{entry.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{entry.email}</td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        {formatBgDate(entry.createdAt)}
                      </td>
                      <td className="py-3 px-4">{entry.serviceName}</td>
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
