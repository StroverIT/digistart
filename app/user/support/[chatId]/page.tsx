import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { SupportChat } from "@/components/support/support-chat";
import {
  SupportChatError,
  getSupportChatById,
  serializeSupportChat,
} from "@/lib/server/support-chats";
import type { SupportChatDto } from "@/lib/support-chat/types";

export default async function UserSupportChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/user/support");
  }

  const role = session.user.role ?? "customer";
  if (role !== "customer" && role !== "admin") {
    redirect("/sign-in?callbackUrl=/user/support");
  }

  const { chatId } = await params;

  if (role === "admin") {
    redirect(`/admin/support/${chatId}`);
  }

  try {
    const chat = await getSupportChatById(chatId, session.user.id, role);
    const initialChat = serializeSupportChat(chat) as SupportChatDto;

    return (
      <div className="space-y-4 max-w-3xl">
        <Link
          href="/user/support"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Обратно към помощ
        </Link>
        <SupportChat initialChat={initialChat} variant="user" key={chatId} />
      </div>
    );
  } catch (error) {
    if (error instanceof SupportChatError) {
      if (error.code === "NOT_FOUND") notFound();
      if (error.code === "FORBIDDEN") notFound();
    }
    throw error;
  }
}
