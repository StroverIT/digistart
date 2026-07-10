import Image from "next/image";
import TransitionLink from "@/components/transitions/TransitionLink";
import {
  SITE_LOGO_HEIGHT,
  SITE_LOGO_SIZES,
  SITE_LOGO_SRC,
  SITE_LOGO_WIDTH,
} from "@/lib/site-brand";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  href?: string;
  size?: "default" | "lg";
};

const siteLogoSizes = {
  default: {
    image: "h-8",
    title: "text-xl",
    tagline: "text-[10px] tracking-[0.2em] sm:text-xs sm:tracking-[0.22em]",
    gap: "gap-2",
  },
  lg: {
    image: "h-12 w-auto sm:h-14",
    title: "text-3xl sm:text-4xl",
    tagline: "text-xs tracking-[0.32em] sm:text-sm sm:tracking-[0.36em]",
    gap: "gap-3",
  },
} as const;

export function SiteLogo({ className, href = "/", size = "default" }: SiteLogoProps) {
  const styles = siteLogoSizes[size];

  return (
    <TransitionLink
      href={href}
      className={cn("group flex items-center rounded-lg", styles.gap, className)}
    >
      <Image
        src={SITE_LOGO_SRC}
        alt="DigiStart logo"
        width={SITE_LOGO_WIDTH}
        height={SITE_LOGO_HEIGHT}
        sizes={SITE_LOGO_SIZES}
        className={cn(styles.image, "w-auto transition-transform group-hover:scale-110")}
      />
      <span className="flex flex-col leading-tight">
        <span className={cn(styles.title, "font-bold tracking-tight")}>
          <span className="text-accent">Digi</span>
          <span className="text-accent">Start</span>
        </span>
        <span
          className={cn(
            styles.tagline,
            "font-medium uppercase text-muted-foreground",
          )}
        >
          Easy Start
        </span>
      </span>
    </TransitionLink>
  );
}
