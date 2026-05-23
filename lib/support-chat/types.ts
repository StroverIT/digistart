export type SupportMessageDto = {
  id: string;
  chatId: string;
  senderType: "user" | "admin" | "system";
  senderUserId: string | null;
  body: string;
  createdAt: string;
};

export type SupportChatDto = {
  id: string;
  userId: string;
  status: "open" | "closed";
  adminJoinedAt: string | null;
  adminNotifiedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string } | null;
  messages: SupportMessageDto[];
};
