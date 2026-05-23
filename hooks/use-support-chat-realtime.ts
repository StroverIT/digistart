"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SupportMessageDto } from "@/lib/support-chat/types";

export type SupportChatRealtimeStatus = "connecting" | "live" | "polling";

function rowToMessage(row: {
  id: string;
  chat_id: string;
  sender_type: string;
  sender_user_id: string | null;
  body: string;
  created_at: string;
}): SupportMessageDto {
  const createdAt =
    typeof row.created_at === "string"
      ? row.created_at
      : new Date(row.created_at as unknown as string).toISOString();

  return {
    id: row.id,
    chatId: row.chat_id,
    senderType: row.sender_type as SupportMessageDto["senderType"],
    senderUserId: row.sender_user_id,
    body: row.body,
    createdAt,
  };
}

export function useSupportChatRealtime(
  chatId: string,
  onMessage: (message: SupportMessageDto) => void,
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const [status, setStatus] = useState<SupportChatRealtimeStatus>("connecting");

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof getSupabaseBrowserClient>["channel"]> | null =
      null;
    let pollFallbackTimer: ReturnType<typeof setTimeout> | null = null;

    function enablePollingFallback() {
      if (cancelled || pollFallbackTimer) return;
      pollFallbackTimer = setTimeout(() => {
        if (!cancelled) setStatus("polling");
      }, 2500);
    }

    async function subscribe() {
      setStatus("connecting");
      try {
        const tokenRes = await fetch("/api/support-chats/realtime-token");
        if (cancelled) return;

        if (!tokenRes.ok) {
          console.warn("useSupportChatRealtime: token", tokenRes.status);
          enablePollingFallback();
          return;
        }

        const { accessToken } = (await tokenRes.json()) as { accessToken: string };
        const supabase = getSupabaseBrowserClient();
        await supabase.realtime.setAuth(accessToken);

        channel = supabase
          .channel(`support-chat:${chatId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "support_messages",
              filter: `chat_id=eq.${chatId}`,
            },
            (payload) => {
              const row = payload.new as {
                id: string;
                chat_id: string;
                sender_type: string;
                sender_user_id: string | null;
                body: string;
                created_at: string;
              };
              onMessageRef.current(rowToMessage(row));
            },
          )
          .subscribe((subscribeStatus, err) => {
            if (cancelled) return;
            if (subscribeStatus === "SUBSCRIBED") {
              if (pollFallbackTimer) {
                clearTimeout(pollFallbackTimer);
                pollFallbackTimer = null;
              }
              setStatus("live");
              return;
            }
            if (
              subscribeStatus === "CHANNEL_ERROR" ||
              subscribeStatus === "TIMED_OUT" ||
              subscribeStatus === "CLOSED"
            ) {
              console.warn("useSupportChatRealtime: channel", subscribeStatus, err);
              enablePollingFallback();
            }
          });
      } catch (error) {
        console.error("useSupportChatRealtime", error);
        if (!cancelled) enablePollingFallback();
      }
    }

    void subscribe();

    return () => {
      cancelled = true;
      if (pollFallbackTimer) clearTimeout(pollFallbackTimer);
      if (channel) {
        const supabase = getSupabaseBrowserClient();
        void supabase.removeChannel(channel);
      }
    };
  }, [chatId]);

  return { status };
}
