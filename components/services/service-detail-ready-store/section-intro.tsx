import { cn } from "@/lib/utils";

export interface ReadyStoreSectionIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
  headingFontClass?: string;
  titleClassName?: string;
}

export function ReadyStoreSectionIntro({
  eyebrow,
  title,
  description,
  headingFontClass,
  titleClassName,
}: ReadyStoreSectionIntroProps) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
      <span
        data-animate-reveal
        className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block opacity-0 translate-y-10"
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
          className="text-muted-foreground text-lg leading-relaxed opacity-0 translate-y-10"
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
