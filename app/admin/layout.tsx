import type { ReactNode } from "react";

/** See app/(site)/layout.tsx — same Next 16 prerender issue with non-ASCII route paths. */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
