"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { productCategories, storeTemplates } from "@/lib/data/templates";
import { PreviewLink } from "@/components/preview/preview-link";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Категория" },
  { id: 2, title: "Шаблон" },
  { id: 3, title: "Бизнес и продукти" },
  { id: 4, title: "Интеграции" },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<TenantProjectDto | null>(null);
  const [category, setCategory] = useState("clothing");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [productNotes, setProductNotes] = useState("");
  const [dbNotes, setDbNotes] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((data: { project?: TenantProjectDto }) => {
        const p = data.project;
        if (p) {
          setProject(p);
          setStep(p.onboardingStep || 1);
          setCategory(p.productCategory);
          setTemplateId(p.templateId);
          const bs = p.businessSettings ?? {};
          setBusinessName(String(bs.businessName ?? ""));
          setBusinessPhone(String(bs.phone ?? ""));
          setBusinessEmail(String(bs.email ?? ""));
          setProductNotes(String(bs.productNotes ?? ""));
          setDbNotes(p.dbMigrationNotes ?? "");
          const ss = p.socialSettings ?? {};
          setSocialFacebook(String(ss.facebook ?? ""));
          setSocialInstagram(String(ss.instagram ?? ""));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (nextStep: number, extra?: Record<string, unknown>) => {
    setSaving(true);
    const res = await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: nextStep,
        productCategory: category,
        templateId: templateId ?? undefined,
        businessSettings: {
          businessName,
          phone: businessPhone,
          email: businessEmail,
          productNotes,
        },
        socialSettings: {
          facebook: socialFacebook,
          instagram: socialInstagram,
        },
        dbMigrationNotes: dbNotes,
        ...extra,
      }),
    });
    const data = await res.json();
    if (data.project) setProject(data.project);
    setSaving(false);
    return res.ok;
  };

  const handleNext = async () => {
    if (step === 1 && !category) return;
    if (step === 2 && !templateId) return;
    const next = Math.min(step + 1, 4);
    const ok = await save(next);
    if (ok) setStep(next);
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = async () => {
    const ok = await save(4, { setupStatus: "in_progress" });
    if (ok) router.push("/user");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const templates = storeTemplates.filter((t) => t.category === category);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={cn(
              "flex-1 min-w-[100px] text-center text-xs sm:text-sm py-2 px-2 rounded-lg border",
              step === s.id
                ? "border-primary bg-primary/10 text-primary font-medium"
                : step > s.id
                  ? "border-primary/30 text-muted-foreground"
                  : "border-border text-muted-foreground",
            )}
          >
            {s.title}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step - 1]?.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                За момента поддържаме категория дрехи. Скоро ще добавим още ниши.
              </p>
              {productCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  disabled={!cat.enabled}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "w-full text-left rounded-lg border p-4 transition-colors",
                    category === cat.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                    !cat.enabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "rounded-lg border p-4 space-y-3",
                    templateId === t.id ? "border-primary ring-1 ring-primary/30" : "border-border",
                  )}
                >
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <PreviewLink
                      href={t.previewPath}
                      ctaId={`onboarding_preview_${t.category}_${t.id}`}
                      ctaPage="/onboarding"
                      className="text-sm text-primary underline"
                    >
                      Преглед
                    </PreviewLink>
                    <PreviewLink
                      href={t.demoPath}
                      ctaId={`onboarding_demo_${t.category}_${t.id}`}
                      ctaPage="/onboarding"
                      className="text-sm text-muted-foreground underline"
                    >
                      Demo рамка
                    </PreviewLink>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={templateId === t.id ? "default" : "outline"}
                    onClick={() => setTemplateId(t.id)}
                  >
                    {templateId === t.id ? "Избран" : "Избери"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Име на бизнеса</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Телефон</Label>
                <Input
                  id="businessPhone"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Имейл за контакт</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productNotes">Продукти и бележки</Label>
                <Textarea
                  id="productNotes"
                  rows={4}
                  placeholder="Опиши продуктите, снимки, цени или линк към каталог..."
                  value={productNotes}
                  onChange={(e) => setProductNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gmail: свързването ще бъде активирано скоро. Засега остави имейла си в стъпка 3 —
                ще се свържем с теб.
              </p>
              {project?.gmailConnectedAt ? (
                <p className="text-sm text-green-600">Gmail е свързан.</p>
              ) : (
                <Button type="button" variant="outline" disabled>
                  Свържи Gmail (скоро)
                </Button>
              )}
              <div className="space-y-2">
                <Label>Facebook страница</Label>
                <Input
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbNotes">Миграция от друг магазин / база данни</Label>
                <Textarea
                  id="dbNotes"
                  rows={3}
                  placeholder="URL за експорт, платформа, бележки за пълен достъп..."
                  value={dbNotes}
                  onChange={(e) => setDbNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1 || saving}>
              Назад
            </Button>
            {step < 4 ? (
              <Button type="button" onClick={handleNext} disabled={saving}>
                {saving ? "Запазване..." : "Напред"}
              </Button>
            ) : (
              <Button type="button" onClick={handleFinish} disabled={saving}>
                {saving ? "Запазване..." : "Завърши"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {project?.previewPath && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Преглед на магазина:{" "}
          <PreviewLink
            href={project.previewPath}
            ctaId="onboarding_preview_saved"
            ctaPage="/onboarding"
            className="text-primary underline"
          >
            отвори шаблона
          </PreviewLink>
        </p>
      )}
    </div>
  );
}
