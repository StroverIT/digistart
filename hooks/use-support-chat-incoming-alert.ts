"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  SUPPORT_SENDER_ADMIN,
  SUPPORT_SENDER_SYSTEM,
  SUPPORT_SENDER_USER,
} from "@/lib/support-chat/constants";
import type { SupportMessageDto } from "@/lib/support-chat/types";

const INCOMING_SOUND_URL = "/sounds/lesiakower-ding-sound-246413.mp3";
const ALERT_TITLE = "● Ново съобщение";
const TITLE_BLINK_MS = 1000;

function shouldAlertForMessage(message: SupportMessageDto, isAdmin: boolean): boolean {
  if (message.senderType === SUPPORT_SENDER_SYSTEM) return false;
  if (isAdmin) return message.senderType === SUPPORT_SENDER_USER;
  return message.senderType === SUPPORT_SENDER_ADMIN;
}

export function useSupportChatIncomingAlert(isAdmin: boolean) {
  const originalTitleRef = useRef<string | null>(null);
  const titleBlinkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isBlinkingRef = useRef(false);

  const stopTitleBlink = useCallback(() => {
    if (titleBlinkIntervalRef.current) {
      clearInterval(titleBlinkIntervalRef.current);
      titleBlinkIntervalRef.current = null;
    }
    isBlinkingRef.current = false;
    if (originalTitleRef.current !== null) {
      document.title = originalTitleRef.current;
    }
  }, []);

  const startTitleBlink = useCallback(() => {
    if (isBlinkingRef.current) return;
    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title;
    }
    isBlinkingRef.current = true;
    let showAlert = true;
    titleBlinkIntervalRef.current = setInterval(() => {
      document.title = showAlert
        ? ALERT_TITLE
        : (originalTitleRef.current ?? document.title);
      showAlert = !showAlert;
    }, TITLE_BLINK_MS);
  }, []);

  const playDing = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(INCOMING_SOUND_URL);
        audioRef.current.volume = 0.65;
      }
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => {
        // Autoplay may be blocked until user interacts with the page
      });
    } catch {
      // ignore
    }
  }, []);

  const notifyIncomingMessage = useCallback(
    (message: SupportMessageDto) => {
      if (!shouldAlertForMessage(message, isAdmin)) return;

      playDing();

      const tabIsActive =
        document.visibilityState === "visible" && document.hasFocus();
      if (!tabIsActive) {
        startTitleBlink();
      }
    },
    [isAdmin, playDing, startTitleBlink],
  );

  useEffect(() => {
    originalTitleRef.current = document.title;

    const handleFocus = () => stopTitleBlink();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") stopTitleBlink();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      stopTitleBlink();
    };
  }, [stopTitleBlink]);

  return { notifyIncomingMessage, stopTitleBlink };
}
