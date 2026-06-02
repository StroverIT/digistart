import { TemplateCard } from "@/components/templates/template-card";
import { getOnboardingTemplates } from "@/lib/data/templates";

const Templates = () => {
  const templates = getOnboardingTemplates();

  if (!templates.length) return null;

  return (
    <section className="space-y-6" id="templates">
      <div className="text-center">
        <h2 className="text-2xl font-semibold sm:text-3xl">Избери темплейт за твоя магазин</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Темплейта е старт, а не финал. Избери темплейт който ти пасва на твоя бранд. След това го адаптираме към твоя бизнес.
        </p>
        <p className="text-sm text-muted-foreground sm:text-base">NOTE: Ако нищо не ти харесва, просто избери някой и ние ще направим останалото за теб.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard key={`${template.category}-${template.id}`} template={template} />
        ))}
      </div>
    </section>
  );
};

export default Templates;
