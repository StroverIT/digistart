import type { ReactNode } from "react";

export default function VideoDetailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pt-24 pb-16 md:pt-28 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
