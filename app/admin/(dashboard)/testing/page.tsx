import { TestingPageClient } from "@/components/admin/testing-page-client";

export default function AdminTestingPage() {
  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h1 className="text-3xl font-bold mb-2">Тестване</h1>
        <p className="text-muted-foreground">
          Инструменти за проверка на интеграции в production (само за администратори).
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
        <TestingPageClient />
      </div>
    </div>
  );
}
