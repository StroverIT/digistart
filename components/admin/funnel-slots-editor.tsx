"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FunnelSlotAvailability } from "@/lib/types";

type FunnelSlotsEditorProps = {
  funnelId: string;
  adminLabel: string;
};

export function FunnelSlotsEditor({ funnelId, adminLabel }: FunnelSlotsEditorProps) {
  const [availability, setAvailability] = useState<FunnelSlotAvailability | null>(null);
  const [draftCapacity, setDraftCapacity] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/funnel-slots?funnelId=${encodeURIComponent(funnelId)}`);
      if (!response.ok) throw new Error("load failed");
      const data = (await response.json()) as { availability?: FunnelSlotAvailability };
      const row = data.availability ?? null;
      setAvailability(row);
      setDraftCapacity(row ? String(row.capacity) : "");
    } catch {
      toast.error("Неуспешно зареждане на местата за фунията.");
    } finally {
      setLoading(false);
    }
  }, [funnelId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    const slotCapacity = Number.parseInt(draftCapacity, 10);
    if (Number.isNaN(slotCapacity) || slotCapacity < 0) {
      toast.error("Броят места трябва да е цяло число ≥ 0.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/funnel-slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelId, slotCapacity }),
      });
      const data = (await response.json()) as {
        availability?: FunnelSlotAvailability;
        error?: string;
      };
      if (!response.ok) {
        toast.error(data.error ?? "Неуспешно записване.");
        return;
      }
      if (data.availability) {
        setAvailability(data.availability);
        setDraftCapacity(String(data.availability.capacity));
      }
      toast.success(`Местата за „${adminLabel}" са запазени.`);
    } catch {
      toast.error("Неуспешно записване.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Зареждане на места...</p>;
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-border/80 bg-background/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Свободни места</p>
        <p className="text-sm">
          Оставащи:{" "}
          <span className="font-bold text-primary tabular-nums">
            {availability?.remaining ?? "—"}
          </span>
          <span className="ml-2 text-muted-foreground">
            (платени: {availability?.paidCount ?? 0})
          </span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <div className="space-y-1">
          <Label htmlFor={`funnel-cap-${funnelId}`}>Общ брой места</Label>
          <Input
            id={`funnel-cap-${funnelId}`}
            type="number"
            min={0}
            value={draftCapacity}
            onChange={(event) => setDraftCapacity(event.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button className="w-full sm:w-auto" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Запис..." : "Запази места"}
          </Button>
        </div>
      </div>
    </div>
  );
}
