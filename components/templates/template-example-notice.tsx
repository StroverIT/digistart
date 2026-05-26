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
        Избери шаблон, който ти харесва приблизително по стил и усещане. Всичко останало - цветове,
        секции, шрифтове, текстове, изображения и функционалности - ще адаптираме според твоите
        продукти и бизнес нужди. Съдържанието в демото е примерно; някои функции може да не работят
        напълно до финалната настройка.
      </p>
    </aside>
  );
}
