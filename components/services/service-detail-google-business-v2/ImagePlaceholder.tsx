import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  width: number;
  height: number;
  label?: string;
  className?: string;
}

export function ImagePlaceholder({ width, height, label, className }: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label ?? `Placeholder ${width}×${height}`}
      className={cn(
        "flex w-full items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/40 text-muted-foreground/70",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <span className="text-xs font-medium tracking-wide">
        {width}×{height}
      </span>
    </div>
  );
}
