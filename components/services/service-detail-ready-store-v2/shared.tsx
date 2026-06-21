import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LANDING_HEADING_CLASS } from "./landing-animation-classes";

export const landingSectionClass =
  "scroll-mt-28 overflow-x-hidden py-14 md:py-20 lg:py-24 border-b border-border/60 last:border-b-0";

export const landingContainerClass = "mx-auto w-full max-w-6xl px-4 sm:px-6";

export const landingDarkSurfaceClass = "relative overflow-hidden bg-foreground text-background";

export function LandingSectionGradients() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />
    </>
  );
}

export const LandingSection = forwardRef<
  HTMLElement,
  {
    id?: string;
    className?: string;
    contentClassName?: string;
    children: ReactNode;
    "data-nav-theme"?: "dark" | "light";
    withGradients?: boolean;
  }
>(function LandingSection({ id, className, contentClassName, children, "data-nav-theme": navTheme, withGradients }, ref) {
  return (
    <section
      ref={ref}
      id={id}
      data-nav-theme={navTheme}
      className={cn(landingSectionClass, withGradients && "relative overflow-hidden", className)}
    >
      {withGradients && <LandingSectionGradients />}
      <div className={cn(landingContainerClass, withGradients && "relative", contentClassName)}>
        {children}
      </div>
    </section>
  );
});

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
      className={cn(LANDING_HEADING_CLASS, "text-balance text-center text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-tight", className)}
    >
      {children}
    </Tag>
  );
}
