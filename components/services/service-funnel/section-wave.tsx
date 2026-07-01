import { cn } from "@/lib/utils";

/** SVG height */
export const sectionWaveSvgClass = "block h-10 w-full sm:h-12 md:h-16";

export const funnelWaveFills = {
  lavender: "text-[#F8F7FF]",
  process: "text-[color-mix(in_oklch,var(--muted)_30%,var(--background))]",
  white: "text-white",
  faq: "text-[color-mix(in_oklch,var(--card)_40%,var(--background))]",
  background: "text-background",
} as const;

const sectionWavePaths = {
  default:
    "M0,40 C180,80 360,0 540,32 C720,64 900,16 1080,40 C1260,64 1350,48 1440,40 L1440,80 L0,80 Z",
  /** Single gentle arc – avoids a sharp crest on the right edge when stretched */
  smooth: "M0,28 C480,76 960,76 1440,28 L1440,80 L0,80 Z",
} as const;

type SectionWaveVariant = keyof typeof sectionWavePaths;

type SectionWaveProps = {
  className?: string;
  /** Tailwind text color class – SVG fill uses currentColor */
  fillClassName?: string;
  variant?: SectionWaveVariant;
};

export function SectionWave({
  className,
  fillClassName = funnelWaveFills.background,
  variant = "default",
}: SectionWaveProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none relative z-10 block w-full shrink-0 leading-[0]", className)}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={cn(sectionWaveSvgClass, fillClassName)}
      >
        <path fill="currentColor" d={sectionWavePaths[variant]} />
      </svg>
    </div>
  );
}
