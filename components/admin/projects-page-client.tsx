"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PreviewLink } from "@/components/preview/preview-link";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";

type ProjectRow = TenantProjectDto & {
  user: { email: string; name: string | null };
};

export function ProjectsPageClient() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((data: { projects?: ProjectRow[] }) => {
        setProjects(data.projects ?? []);
        if (data.projects?.length && !selectedId) {
          setSelectedId(data.projects[0].id);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const selected = projects.find((p) => p.id === selectedId);

  const updateStatus = async (setupStatus: string) => {
    if (!selected) return;
    await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, setupStatus }),
    });
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Проекти ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Няма проекти още.</p>
          ) : (
            projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${selectedId === p.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                  }`}
              >
                <p className="font-medium truncate">{p.user.name ?? p.user.email}</p>
                <p className="text-xs text-muted-foreground truncate">{p.user.email}</p>
                <p className="text-xs mt-1 capitalize">{p.setupStatus}</p>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {selected ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Детайли</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Клиент</span>
                <p className="font-medium">{selected.user.name ?? "-"}</p>
                <p>{selected.user.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Категория</span>
                <p className="font-medium capitalize">{selected.productCategory}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Шаблон</span>
                <p className="font-medium">{selected.templateId ?? "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Статус</Label>
                <Select value={selected.setupStatus} onValueChange={updateStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="in_progress">in_progress</SelectItem>
                    <SelectItem value="live">live</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selected.previewPath && (
              <div className="flex flex-wrap gap-3 pt-2">
                <PreviewLink
                  href={selected.previewPath}
                  ctaId="admin_project_preview"
                  ctaPage="/admin/projects"
                  className="inline-flex items-center gap-2 text-primary underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Преглед на сайта
                </PreviewLink>
              </div>
            )}

            {selected.businessSettings && (
              <div>
                <p className="text-muted-foreground mb-1">Бизнес настройки</p>
                <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-40">
                  {JSON.stringify(selected.businessSettings, null, 2)}
                </pre>
              </div>
            )}

            {selected.socialSettings && (
              <div>
                <p className="text-muted-foreground mb-1">Социални мрежи</p>
                {typeof selected.socialSettings.googleBusinessUrl === "string" &&
                selected.socialSettings.googleBusinessUrl ? (
                  <p className="mb-2 text-sm break-all">
                    <span className="text-muted-foreground">Google Business: </span>
                    {selected.socialSettings.googleBusinessUrl}
                  </p>
                ) : null}
                {Array.isArray(selected.socialSettings.channels) &&
                selected.socialSettings.channels.length > 0 ? (
                  <ul className="mb-2 space-y-1 text-sm">
                    {(selected.socialSettings.channels as Array<Record<string, unknown>>).map(
                      (ch, i) => (
                        <li key={i} className="break-all">
                          {typeof ch.label === "string" && ch.label ? `${ch.label}: ` : `Канал ${i + 1}: `}
                          {String(ch.profileUrl ?? "")}
                        </li>
                      ),
                    )}
                  </ul>
                ) : null}
                <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-32">
                  {JSON.stringify(selected.socialSettings, null, 2)}
                </pre>
              </div>
            )}

            {selected.dbMigrationNotes && (
              <div>
                <p className="text-muted-foreground mb-1">Бележки за миграция</p>
                <p className="rounded-md bg-muted p-3">{selected.dbMigrationNotes}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Gmail: {selected.gmailConnectedAt ? "свързан" : "не е свързан"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="lg:col-span-2">
          <CardContent className="py-16 text-center text-muted-foreground">
            Избери проект от списъка.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
