"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ThreeFreeTipsVideoUrlEditor() {
  const [videoUrl, setVideoUrl] = useState("");
  const [defaultVideoUrl, setDefaultVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/three-free-tips-video");
      if (!response.ok) throw new Error("load failed");
      const data = (await response.json()) as {
        videoUrl?: string;
        defaultVideoUrl?: string;
      };
      setVideoUrl(data.videoUrl ?? "");
      setDefaultVideoUrl(data.defaultVideoUrl ?? "");
    } catch {
      toast.error("Неуспешно зареждане на линка към клипа.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    const trimmed = videoUrl.trim();
    if (!trimmed) {
      toast.error("Моля, въведете линк.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/three-free-tips-video", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: trimmed }),
      });
      const data = (await response.json()) as {
        videoUrl?: string;
        error?: string;
      };
      if (!response.ok) {
        toast.error(data.error ?? "Неуспешно записване.");
        return;
      }
      if (data.videoUrl) setVideoUrl(data.videoUrl);
      toast.success("Линкът към клипа е запазен.");
    } catch {
      toast.error("Неуспешно записване.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/60 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Зареждане на линка...
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/80 bg-background/60 p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Линк към клипа в имейла</p>
        <p className="text-xs text-muted-foreground">
          Този URL се изпраща на абонатите след записване за 3 безплатни съвета.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="space-y-1">
          <Label htmlFor="three-free-tips-video-url">URL</Label>
          <Input
            id="three-free-tips-video-url"
            type="url"
            placeholder={defaultVideoUrl || "https://youtu.be/..."}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={saving}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="sm:self-end"
          asChild
          disabled={!videoUrl.trim()}
        >
          <a href={videoUrl.trim() || undefined} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Отвори
          </a>
        </Button>
        <Button
          type="button"
          className="sm:self-end"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Запазване...
            </>
          ) : (
            "Запази"
          )}
        </Button>
      </div>
    </div>
  );
}
