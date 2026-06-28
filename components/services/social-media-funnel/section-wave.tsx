import { cn } from "@/lib/utils";

type SectionWaveProps = {
  className?: string;
  /** Tailwind text color class – SVG fill uses currentColor */
  fillClassName?: string;
  flip?: boolean;
};

export function SectionWave({
  className,
  fillClassName = "text-background",
  flip = false,
}: SectionWaveProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none relative -mt-px w-full leading-[0]",
        flip && "rotate-180",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={cn("block h-8 w-full sm:h-12 md:h-16", fillClassName)}
      >
        <path
          fill="currentColor"
          d="M0,40 C180,80 360,0 540,32 C720,64 900,16 1080,40 C1260,64 1350,48 1440,40 L1440,80 L0,80 Z"
        />
      </svg>
    </div>
  );
}
