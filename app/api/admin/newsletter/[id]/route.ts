import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { removeNewsletterSubscriber } from "@/lib/server/newsletter";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const removed = await removeNewsletterSubscriber(id);
    if (!removed) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id: removed.id });
  } catch (error) {
    console.error("removeNewsletterSubscriber", error);
    return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 });
  }
}
