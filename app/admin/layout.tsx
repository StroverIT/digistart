import type { ReactNode } from "react";

/** See app/(site)/layout.tsx — force-dynamic for admin shell. */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
