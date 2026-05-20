import { cn } from "@/lib/utils";

type TemplateExampleNoticeProps = {
  className?: string;
};

export function TemplateExampleNotice({ className }: TemplateExampleNoticeProps) {
  return (
    <aside
      className={cn(
        "rounded-lg border-2 border-red-500 bg-muted/30 px-4 py-3 text-sm text-muted-foreground leading-relaxed",
        className,
      )}
    >
      <p>
        Всички текстове и изображения в шаблоните са примерни. В демото някои функционалности може
        да не работят напълно — финалният онлайн магазин се адаптира според облеклата и конкретните
        нужди на твоя бизнес.
      </p>
    </aside>
  );
}
