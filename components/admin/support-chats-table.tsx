"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SupportChatListItem } from "@/lib/server/support-chats";
import { SUPPORT_CHAT_STATUS_OPEN } from "@/lib/support-chat/constants";

type SupportChatsTableProps = {
  chats: SupportChatListItem[];
};

const statusLabel: Record<string, string> = {
  open: "Отворен",
  closed: "Затворен",
};

export function SupportChatsTable({ chats }: SupportChatsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return chats.filter((chat) => {
      if (statusFilter !== "all" && chat.status !== statusFilter) return false;
      if (!q) return true;
      const email = chat.user.email.toLowerCase();
      const name = (chat.user.name ?? "").toLowerCase();
      const problem = (chat.problemPreview ?? "").toLowerCase();
      return email.includes(q) || name.includes(q) || problem.includes(q);
    });
  }, [chats, search, statusFilter]);

  const openCount = chats.filter((c) => c.status === SUPPORT_CHAT_STATUS_OPEN).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {openCount > 0 ? (
            <span className="font-medium text-foreground">{openCount} отворени</span>
          ) : (
            "Няма отворени чатове"
          )}
          {" · "}
          {chats.length} общо
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Търси по имейл..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички</SelectItem>
              <SelectItem value="open">Отворени</SelectItem>
              <SelectItem value="closed">Затворени</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Няма чатове по избраните критерии</p>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Имейл</TableHead>
                <TableHead>Проблем</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Обновен</TableHead>
                <TableHead className="text-right">Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((chat) => (
                <TableRow key={chat.id}>
                  <TableCell className="font-medium">
                    {chat.user.name ?? "-"}
                  </TableCell>
                  <TableCell>{chat.user.email}</TableCell>
                  <TableCell className="max-w-[240px]">
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {chat.problemPreview ?? "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        chat.status === SUPPORT_CHAT_STATUS_OPEN ? "default" : "secondary"
                      }
                    >
                      {statusLabel[chat.status] ?? chat.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(chat.updatedAt).toLocaleString("bg-BG", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/support/${chat.id}`}>
                        <MessageCircle className="h-4 w-4 mr-1.5" />
                        Отвори чата
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
