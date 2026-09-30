"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export function ThreeFreeTipsVideoClickTracker() {
  const searchParams = useSearchParams();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    const uid = searchParams.get("uid")?.trim();
    const stageRaw = searchParams.get("stage");
    if (!uid || !stageRaw) return;

    const stage = Number(stageRaw);
    if (!Number.isInteger(stage) || stage < 1) return;

    const dedupeKey = `${uid}:${stage}`;
    if (trackedRef.current === dedupeKey) return;
    trackedRef.current = dedupeKey;

    const sessionKey = `tips-video-click:${dedupeKey}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) {
      return;
    }

    void fetch("/api/newsletter/three-free-tips/video-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, stage }),
    })
      .then((res) => {
        if (res.ok && typeof window !== "undefined") {
          sessionStorage.setItem(sessionKey, "1");
        }
      })
      .catch(() => {
        trackedRef.current = null;
      });
  }, [searchParams]);

  return null;
}
