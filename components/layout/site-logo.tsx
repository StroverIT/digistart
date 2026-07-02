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
};

export function SiteLogo({ className, href = "/" }: SiteLogoProps) {
  return (
    <TransitionLink
      href={href}
      className={cn("group flex items-center gap-2 rounded-lg", className)}
    >
      <Image
        src={SITE_LOGO_SRC}
        alt="DigiStart logo"
        width={SITE_LOGO_WIDTH}
        height={SITE_LOGO_HEIGHT}
        sizes={SITE_LOGO_SIZES}
        className="h-8 w-auto transition-transform group-hover:scale-110"
      />
      <span className="flex flex-col leading-tight">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-accent">Digi</span>
          <span className="text-accent">Start</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs">
          Easy Start
        </span>
      </span>
    </TransitionLink>
  );
}
