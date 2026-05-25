import { cn } from "@/lib/utils";

export interface PasSectionIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
  headingFontClass?: string;
  titleClassName?: string;
}

export function PasSectionIntro({
  eyebrow,
  title,
  description,
  headingFontClass,
  titleClassName,
}: PasSectionIntroProps) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
      <span
        data-animate-reveal
        className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4 opacity-0 translate-y-10"
      >
        {eyebrow}
      </span>
      <h2
        data-animate-reveal
        className={cn(
          headingFontClass,
          "text-3xl sm:text-4xl md:text-5xl font-bold text-balance opacity-0 translate-y-10",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          data-animate-reveal
          className="text-muted-foreground text-base sm:text-lg leading-relaxed opacity-0 translate-y-10 mt-4"
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
