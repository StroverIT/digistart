import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type SupportChatSession = {
  userId: string;
  role: string;
  name?: string | null;
  email?: string | null;
};

export async function requireSupportChatSession(): Promise<
  SupportChatSession | null
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const role = session.user.role ?? "customer";
  if (role !== "customer" && role !== "admin") return null;
  return {
    userId: session.user.id,
    role,
    name: session.user.name,
    email: session.user.email,
  };
}
