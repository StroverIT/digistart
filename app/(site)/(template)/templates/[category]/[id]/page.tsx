import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateDetailView } from "@/components/templates/template-detail-view";
import { getTemplate } from "@/lib/data/templates";

type TemplateDetailPageProps = {
  params: Promise<{ category: string; id: string }>;
};

export async function generateMetadata({ params }: TemplateDetailPageProps): Promise<Metadata> {
  const { category, id } = await params;
  const template = getTemplate(category, id);
  if (!template) return { title: "Шаблон" };

  return {
    title: `${template.name} — шаблон за онлайн магазин`,
    description: template.description,
  };
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { category, id } = await params;
  const template = getTemplate(category, id);
  if (!template) notFound();

  return (
    <main className="pt-24 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <TemplateDetailView template={template} />
      </div>
    </main>
  );
}
