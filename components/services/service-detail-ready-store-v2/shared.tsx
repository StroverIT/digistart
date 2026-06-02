import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const landingSectionClass =
  "scroll-mt-28 py-14 md:py-20 lg:py-24 border-b border-border/60 last:border-b-0";

export const landingContainerClass = "mx-auto w-full max-w-6xl px-4 sm:px-6";

export function LandingSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn(landingSectionClass, className)}>
      <div className={landingContainerClass}>{children}</div>
    </section>
  );
}

export function LandingSectionTitle({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: "h1" | "h2";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "font-heading text-balance text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-tight",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
