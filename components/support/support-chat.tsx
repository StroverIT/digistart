"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSupportChatIncomingAlert } from "@/hooks/use-support-chat-incoming-alert";
import { useSupportChatRealtime } from "@/hooks/use-support-chat-realtime";
import type { SupportChatDto } from "@/lib/support-chat/types";
import {
  SUPPORT_SENDER_ADMIN,
  SUPPORT_SENDER_SYSTEM,
  SUPPORT_SENDER_USER,
} from "@/lib/support-chat/constants";
import type { SupportMessageDto } from "@/lib/support-chat/types";

type SupportChatProps = {
  initialChat: SupportChatDto;
  /** When set, admin UI is used even before session hydrates (admin dashboard). */
  variant?: "admin" | "user";
};

function mergeMessage(
  messages: SupportMessageDto[],
  incoming: SupportMessageDto,
): SupportMessageDto[] {
  if (messages.some((m) => m.id === incoming.id)) return messages;
  return [...messages, incoming].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: SupportMessageDto;
  isOwn: boolean;
}) {
  if (message.senderType === SUPPORT_SENDER_SYSTEM) {
    return (
      <p className="text-center text-xs text-muted-foreground px-4 py-2 max-w-md mx-auto">
        {message.body}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground",
        )}
      >
        {message.body}
      </div>
    </div>
  );
}

export function SupportChat({ initialChat, variant = "user" }: SupportChatProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [chat, setChat] = useState(initialChat);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const knownMessageIdsRef = useRef(new Set(initialChat.messages.map((m) => m.id)));

  const role = session?.user?.role ?? (variant === "admin" ? "admin" : "customer");
  const userId = session?.user?.id ?? "";
  const isAdmin = variant === "admin" || role === "admin";
  const isClosed = chat.status === "closed";

  const { notifyIncomingMessage } = useSupportChatIncomingAlert(isAdmin);

  const handleIncomingMessage = useCallback(
    (message: SupportMessageDto) => {
      if (!knownMessageIdsRef.current.has(message.id)) {
        knownMessageIdsRef.current.add(message.id);
        notifyIncomingMessage(message);
      }
      setChat((prev) => ({
        ...prev,
        messages: mergeMessage(prev.messages, message),
      }));
    },
    [notifyIncomingMessage],
  );

  const { status: realtimeStatus } = useSupportChatRealtime(chat.id, handleIncomingMessage);

  useEffect(() => {
    setChat(initialChat);
    for (const message of initialChat.messages) {
      knownMessageIdsRef.current.add(message.id);
    }
  }, [initialChat]);

  const refreshChatFromApi = useCallback(async () => {
    try {
      const res = await fetch(`/api/support-chats/${chat.id}`);
      if (!res.ok) return;
      const data = (await res.json()) as { chat: SupportChatDto };
      for (const message of data.chat.messages) {
        if (!knownMessageIdsRef.current.has(message.id)) {
          knownMessageIdsRef.current.add(message.id);
          notifyIncomingMessage(message);
        }
      }
      setChat(data.chat);
    } catch {
      // ignore polling errors
    }
  }, [chat.id, notifyIncomingMessage]);

  useEffect(() => {
    if (realtimeStatus !== "polling") return;
    void refreshChatFromApi();
    const interval = setInterval(() => void refreshChatFromApi(), 4000);
    return () => clearInterval(interval);
  }, [realtimeStatus, refreshChatFromApi]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length]);

  useEffect(() => {
    if (!isAdmin) return;
    void fetch(`/api/support-chats/${chat.id}/join`, { method: "POST" }).then(
      async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { chat: SupportChatDto };
        setChat(data.chat);
      },
    );
  }, [chat.id, isAdmin]);

  async function sendMessage() {
    const body = draft.trim();
    if (!body || sending || isClosed) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/support-chats/${chat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Неуспешно изпращане");
        return;
      }
      setDraft("");
      setChat(data.chat as SupportChatDto);
    } catch {
      setError("Неуспешно изпращане");
    } finally {
      setSending(false);
    }
  }

  async function closeChat() {
    if (closing || isClosed) return;
    setClosing(true);
    setError(null);
    try {
      const res = await fetch(`/api/support-chats/${chat.id}/close`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Неуспешно затваряне");
        return;
      }
      router.push("/user/support");
      router.refresh();
    } catch {
      setError("Неуспешно затваряне");
    } finally {
      setClosing(false);
    }
  }

  function isOwnMessage(message: SupportMessageDto) {
    if (message.senderType === SUPPORT_SENDER_SYSTEM) return false;
    if (isAdmin) return message.senderType === SUPPORT_SENDER_ADMIN;
    return message.senderType === SUPPORT_SENDER_USER;
  }

  const customerLabel = chat.user?.name ?? chat.user?.email ?? "Клиент";

  return (
    <div className="flex h-[min(70vh,640px)] flex-col rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="font-semibold">
            {isAdmin ? `Чат с ${customerLabel}` : "Поискай помощ"}
          </h2>
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{isClosed ? "Затворен" : "Отворен"}</span>
            {!isClosed && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  realtimeStatus === "live"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : realtimeStatus === "connecting"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    realtimeStatus === "live"
                      ? "bg-emerald-500 animate-pulse"
                      : realtimeStatus === "connecting"
                        ? "bg-amber-500"
                        : "bg-muted-foreground",
                  )}
                />
                {realtimeStatus === "live"
                  ? "Свързан"
                  : realtimeStatus === "connecting"
                    ? "Свързване..."
                    : "Свързан"}
              </span>
            )}
            {isAdmin && chat.user?.email ? <span>· {chat.user.email}</span> : null}
          </p>
        </div>
        {!isAdmin && !isClosed && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={closing}
            onClick={() => void closeChat()}
          >
            {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Затвори чата"}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-3">
          {chat.messages.length === 0 && !isClosed && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Опишете проблема си и ние ще се свържем с вас възможно най-скоро.
            </p>
          )}
          {chat.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwnMessage(message)}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {error && (
        <p className="px-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="border-t border-border p-4">
        {isClosed ? (
          <p className="text-sm text-muted-foreground text-center">
            {isAdmin
              ? "Този чат е затворен от клиента."
              : "Този чат е затворен. Можете да започнете нов от страницата за помощ."}
          </p>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Напишете съобщение..."
              rows={2}
              className="min-h-[44px] resize-none"
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
            />
            <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Изпрати</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
