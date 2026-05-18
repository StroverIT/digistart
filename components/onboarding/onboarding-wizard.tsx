"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingIntegrationsStep } from "@/components/onboarding/onboarding-integrations-step";
import { productCategories, storeTemplates } from "@/lib/data/templates";
import {
  getActiveWizardSteps,
  getNextWizardStep,
  getPrevWizardStep,
  isValidUrl,
  normalizeWizardStep,
  parseSocialChannelsFromSettings,
  type OnboardingRequirements,
  type SocialChannelInput,
} from "@/lib/onboarding/requirements";
import { resolveTemplatePreviewUrl } from "@/lib/preview-url";
import { PreviewLink } from "@/components/preview/preview-link";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";
import { cn } from "@/lib/utils";

const DEFAULT_REQUIREMENTS: OnboardingRequirements = {
  showCategoryTemplate: true,
  showBusiness: true,
  showIntegrations: true,
  socialChannelCount: 0,
  showGoogleBusinessLink: false,
  showStoreSocialFields: true,
};

type OnboardingWizardProps = {
  orderItemId?: string | null;
};

export function OnboardingWizard({ orderItemId: orderItemIdProp }: OnboardingWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderItemId = orderItemIdProp ?? searchParams.get("orderItemId");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<TenantProjectDto | null>(null);
  const [requirements, setRequirements] = useState<OnboardingRequirements>(DEFAULT_REQUIREMENTS);
  const [category, setCategory] = useState("clothing");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [productNotes, setProductNotes] = useState("");
  const [channels, setChannels] = useState<SocialChannelInput[]>([]);
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("");
  const [storeFacebook, setStoreFacebook] = useState("");
  const [storeInstagram, setStoreInstagram] = useState("");

  const activeSteps = useMemo(() => getActiveWizardSteps(requirements), [requirements]);
  const isLastStep = step === activeSteps[activeSteps.length - 1]?.id;
  const isFirstStep = step === activeSteps[0]?.id;

  const hydrateFromProject = useCallback(
    (p: TenantProjectDto, req: OnboardingRequirements) => {
      setProject(p);
      setStep(normalizeWizardStep(p.onboardingStep || 1, req));
      setCategory(p.productCategory);
      setTemplateId(p.templateId);
      const bs = p.businessSettings ?? {};
      setBusinessName(String(bs.businessName ?? ""));
      setBusinessPhone(String(bs.phone ?? ""));
      setBusinessEmail(String(bs.email ?? ""));
      setProductNotes(String(bs.productNotes ?? ""));
      const ss = p.socialSettings ?? {};
      setGoogleBusinessUrl(String(ss.googleBusinessUrl ?? ""));
      setStoreFacebook(String(ss.facebook ?? ""));
      setStoreInstagram(String(ss.instagram ?? ""));
      setChannels(parseSocialChannelsFromSettings(ss, req.socialChannelCount));
    },
    [],
  );

  useEffect(() => {
    const query = orderItemId ? `?orderItemId=${encodeURIComponent(orderItemId)}` : "";
    fetch(`/api/onboarding${query}`)
      .then((r) => r.json())
      .then(
        (data: { project?: TenantProjectDto; requirements?: OnboardingRequirements }) => {
          const req = data.requirements ?? DEFAULT_REQUIREMENTS;
          setRequirements(req);
          if (data.project) hydrateFromProject(data.project, req);
          setChannels((prev) => {
            if (prev.length > 0) return prev;
            return parseSocialChannelsFromSettings(data.project?.socialSettings ?? {}, req.socialChannelCount);
          });
        },
      )
      .finally(() => setLoading(false));
  }, [orderItemId, hydrateFromProject]);

  useEffect(() => {
    if (requirements.socialChannelCount <= 0) return;
    setChannels((prev) => {
      const parsed = parseSocialChannelsFromSettings(
        project?.socialSettings ?? {},
        requirements.socialChannelCount,
      );
      if (prev.length === requirements.socialChannelCount) return prev;
      return parsed;
    });
  }, [requirements.socialChannelCount, project?.socialSettings]);

  const buildPayload = () => {
    const socialSettings: Record<string, unknown> = {
      ...(requirements.socialChannelCount > 0
        ? {
            channels: channels.map((c) => ({
              label: c.label?.trim() || undefined,
              profileUrl: c.profileUrl.trim(),
            })),
          }
        : {}),
      ...(requirements.showStoreSocialFields
        ? { facebook: storeFacebook, instagram: storeInstagram }
        : {}),
      ...(requirements.showGoogleBusinessLink
        ? { googleBusinessUrl: googleBusinessUrl.trim() || undefined }
        : {}),
    };

    return {
      productCategory: category,
      templateId: templateId ?? undefined,
      businessSettings: {
        businessName,
        phone: businessPhone,
        email: businessEmail,
        productNotes,
      },
      socialSettings,
    };
  };

  const save = async (nextStep: number, extra?: Record<string, unknown>) => {
    setSaving(true);
    const res = await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: nextStep,
        ...buildPayload(),
        ...extra,
      }),
    });
    const data = await res.json();
    if (data.project) setProject(data.project);
    setSaving(false);
    return res.ok;
  };

  const validateIntegrations = (): boolean => {
    if (requirements.socialChannelCount > 0) {
      for (let i = 0; i < requirements.socialChannelCount; i++) {
        const url = channels[i]?.profileUrl ?? "";
        if (!isValidUrl(url)) {
          toast.error(`Моля, въведете валиден линк за канал ${i + 1}.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (step === 1 && !category) return;
    if (step === 2 && !templateId) return;
    if (step === 4 && !validateIntegrations()) return;

    const next = getNextWizardStep(step, requirements);
    if (next == null) return;

    const ok = await save(next);
    if (ok) setStep(next);
  };

  const handleBack = () => {
    const prev = getPrevWizardStep(step, requirements);
    if (prev != null) setStep(prev);
  };

  const handleFinish = async () => {
    if (!validateIntegrations()) return;
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
  const currentStepTitle = activeSteps.find((s) => s.id === step)?.title ?? "";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {activeSteps.map((s) => (
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
          <CardTitle>{currentStepTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && requirements.showCategoryTemplate ? (
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
          ) : null}

          {step === 2 && requirements.showCategoryTemplate ? (
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
                      href={resolveTemplatePreviewUrl(t)}
                      ctaId={`onboarding_preview_${t.category}_${t.id}`}
                      ctaPage="/onboarding"
                      className="text-sm text-primary underline"
                    >
                      Преглед
                    </PreviewLink>
                    <PreviewLink
                      href={t.demoPath}
                      ctaId={`onboarding_detail_${t.category}_${t.id}`}
                      ctaPage="/onboarding"
                      className="text-sm text-muted-foreground underline"
                    >
                      Детайли
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
          ) : null}

          {step === 3 && requirements.showBusiness ? (
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
              {requirements.showCategoryTemplate ? (
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
              ) : null}
            </div>
          ) : null}

          {step === 4 && requirements.showIntegrations ? (
            <OnboardingIntegrationsStep
              requirements={requirements}
              channels={channels}
              onChannelsChange={setChannels}
              googleBusinessUrl={googleBusinessUrl}
              onGoogleBusinessUrlChange={setGoogleBusinessUrl}
              storeFacebook={storeFacebook}
              onStoreFacebookChange={setStoreFacebook}
              storeInstagram={storeInstagram}
              onStoreInstagramChange={setStoreInstagram}
            />
          ) : null}

          <div className="flex justify-between pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleBack} disabled={isFirstStep || saving}>
              Назад
            </Button>
            {!isLastStep ? (
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

      {project?.previewPath ? (
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
      ) : null}
    </div>
  );
}
