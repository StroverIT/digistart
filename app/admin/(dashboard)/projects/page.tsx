import { ProjectsPageClient } from "@/components/admin/projects-page-client";
import { StoreDomainsPanel } from "@/components/admin/store-domains-panel";

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Проекти</h1>
        <p className="text-muted-foreground">
          Управление на онлайн магазини, шаблони, социални мрежи и настройки на клиенти.
        </p>
      </div>
      <StoreDomainsPanel />
      <ProjectsPageClient />
    </div>
  );
}
