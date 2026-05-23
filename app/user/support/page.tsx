import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SupportHome } from "@/components/support/support-home";

export default async function UserSupportPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "admin") {
    redirect("/admin/support");
  }
  return <SupportHome />;
}
