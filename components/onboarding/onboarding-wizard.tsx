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
import {
  getOnboardingTemplates,
  productCategories,
  type ProductCategory,
} from "@/lib/data/templates";
import {
  getActiveWizardSteps,
  getNextWizardStep,
  getPrevWizardStep,
  isValidEmail,
  isValidUrl,
  normalizeSocialChannels,
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

type SavePayload = {
  productCategory?: string;
  templateId?: string | null;
  businessSettings?: Record<string, string>;
  socialSettings?: Record<string, unknown>;
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
  const [category, setCategory] = useState<ProductCategory>("clothing");
  const [otherCategoryLabel, setOtherCategoryLabel] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [productNotes, setProductNotes] = useState("");
  const [channels, setChannels] = useState<SocialChannelInput[]>([]);
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("");

  const activeSteps = useMemo(() => getActiveWizardSteps(requirements), [requirements]);
  const isLastStep = step === activeSteps[activeSteps.length - 1]?.id;
  const isFirstStep = step === activeSteps[0]?.id;
  const isOtherCategory = category === "other";
  const minSocialChannels = Math.max(requirements.socialChannelCount, 1);

  const hydrateFromProject = useCallback(
    (p: TenantProjectDto, req: OnboardingRequirements) => {
      setProject(p);
      setStep(normalizeWizardStep(p.onboardingStep || 1, req));
      const cat = p.productCategory as ProductCategory;
      setCategory(
        cat === "clothing" || cat === "cosmetics" || cat === "food" || cat === "other"
          ? cat
          : "clothing",
      );
      setTemplateId(p.templateId);
      const bs = p.businessSettings ?? {};
      setBusinessName(String(bs.businessName ?? ""));
      setBusinessPhone(String(bs.phone ?? ""));
      setBusinessEmail(String(bs.email ?? ""));
      setProductNotes(String(bs.productNotes ?? ""));
      setOtherCategoryLabel(String(bs.customCategoryLabel ?? ""));
      const ss = p.socialSettings ?? {};
      setGoogleBusinessUrl(String(ss.googleBusinessUrl ?? ""));
      const minChannels = Math.max(req.socialChannelCount, 1);
      setChannels(parseSocialChannelsFromSettings(ss, minChannels));
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
          if (data.project) {
            hydrateFromProject(data.project, req);
          } else {
            const minChannels = Math.max(req.socialChannelCount, 1);
            setChannels(parseSocialChannelsFromSettings({}, minChannels));
          }
        },
      )
      .finally(() => setLoading(false));
  }, [orderItemId, hydrateFromProject]);

  const buildBusinessSettings = (): Record<string, string> => ({
    businessName: businessName.trim(),
    phone: businessPhone.trim(),
    email: businessEmail.trim(),
    productNotes: productNotes.trim(),
    ...(category === "other" && otherCategoryLabel.trim()
      ? { customCategoryLabel: otherCategoryLabel.trim() }
      : {}),
  });

  const buildSocialSettings = (): Record<string, unknown> => {
    const filledChannels = channels
      .filter((c) => c.label?.trim() || c.profileUrl.trim())
      .map((c) => ({
        label: c.label?.trim() || undefined,
        profileUrl: c.profileUrl.trim(),
      }));

    return {
      channels: filledChannels,
      ...(requirements.showGoogleBusinessLink
        ? { googleBusinessUrl: googleBusinessUrl.trim() || undefined }
        : {}),
    };
  };

  const buildPayload = (overrides?: Partial<SavePayload>): SavePayload => ({
    productCategory: category,
    templateId: templateId ?? undefined,
    businessSettings: buildBusinessSettings(),
    socialSettings: buildSocialSettings(),
    ...overrides,
  });

  const save = async (
    nextStep: number,
    extra?: Record<string, unknown>,
    payloadOverrides?: Partial<SavePayload>,
  ) => {
    setSaving(true);
    const payload = buildPayload(payloadOverrides);
    const res = await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: nextStep,
        ...payload,
        ...extra,
      }),
    });
    const data = await res.json();
    if (data.project) setProject(data.project);
    setSaving(false);
    if (!res.ok) {
      toast.error("Неуспешно запазване. Опитайте отново.");
    }
    return res.ok;
  };

  const advanceToStep = async (
    nextStep: number,
    payloadOverrides?: Partial<SavePayload>,
  ) => {
    if (saving) return false;
    const ok = await save(nextStep, undefined, payloadOverrides);
    if (ok) setStep(nextStep);
    return ok;
  };

  const validateCategoryStep = (): boolean => {
    if (!category) {
      toast.error("Моля, изберете категория.");
      return false;
    }
    if (category === "other" && !otherCategoryLabel.trim()) {
      toast.error("Моля, опишете вашата категория.");
      return false;
    }
    return true;
  };

  const validateBusinessStep = (): boolean => {
    if (!businessName.trim()) {
      toast.error("Моля, въведете име на бизнеса.");
      return false;
    }
    if (!businessPhone.trim()) {
      toast.error("Моля, въведете телефон.");
      return false;
    }
    if (!businessEmail.trim()) {
      toast.error("Моля, въведете имейл за контакт.");
      return false;
    }
    if (!isValidEmail(businessEmail)) {
      toast.error("Моля, въведете валиден имейл адрес.");
      return false;
    }
    if (requirements.showCategoryTemplate && !productNotes.trim()) {
      toast.error("Моля, опишете продуктите и бележките.");
      return false;
    }
    return true;
  };

  const validateSocialNetworks = (): boolean => {
    const active = channels.filter((c) => c.label?.trim() || c.profileUrl.trim());
    for (let i = 0; i < active.length; i++) {
      const ch = active[i];
      if (!isValidUrl(ch.profileUrl)) {
        toast.error(
          `Моля, въведете валиден линк за социална мрежа ${i + 1}.`,
        );
        return false;
      }
    }

    const validCount = active.filter((c) => isValidUrl(c.profileUrl)).length;
    if (requirements.socialChannelCount > 0 && validCount < requirements.socialChannelCount) {
      toast.error(
        `Моля, добавете поне ${requirements.socialChannelCount} валидни линка към социални мрежи.`,
      );
      return false;
    }

    if (requirements.showGoogleBusinessLink) {
      const url = googleBusinessUrl.trim();
      if (!url || !isValidUrl(url)) {
        toast.error("Моля, въведете валиден линк към Google Business профила.");
        return false;
      }
    }

    return true;
  };

  const handleCategorySelect = (catId: ProductCategory) => {
    setCategory(catId);
    if (catId === "other") return;

    const next = getNextWizardStep(1, requirements);
    if (next == null) return;
    void advanceToStep(next, { productCategory: catId });
  };

  const handleTemplateSelect = (id: string) => {
    setTemplateId(id);
    const next = getNextWizardStep(2, requirements);
    if (next == null) return;
    void advanceToStep(next, { templateId: id });
  };

  const handleNext = async () => {
    if (step === 1 && !validateCategoryStep()) return;
    if (step === 2 && !templateId) {
      toast.error("Моля, изберете шаблон.");
      return;
    }
    if (step === 3 && !validateBusinessStep()) return;
    if (step === 4 && !validateSocialNetworks()) return;

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
    if (!validateSocialNetworks()) return;
    const ok = await save(4, { setupStatus: "in_progress" });
    if (ok) {
      if (orderItemId) {
        router.push(`/user/services/${orderItemId}`);
      } else {
        router.push("/user");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const templates = getOnboardingTemplates(category);
  const currentStepTitle = activeSteps.find((s) => s.id === step)?.title ?? "";
  const showStep1Continue = step === 1 && isOtherCategory && otherCategoryLabel.trim().length > 0;

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
                Изберете категорията, която най-добре описва вашия бизнес.
              </p>
              {productCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  disabled={!cat.enabled || saving}
                  onClick={() => handleCategorySelect(cat.id)}
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

              {isOtherCategory ? (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="otherCategory">Вашата категория</Label>
                  <Input
                    id="otherCategory"
                    value={otherCategoryLabel}
                    onChange={(e) => setOtherCategoryLabel(e.target.value)}
                    placeholder="напр. Спортни стоки, подаръци..."
                  />
                </div>
              ) : null}
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
                    disabled={saving}
                    onClick={() => handleTemplateSelect(t.id)}
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
                <Label htmlFor="businessName">
                  Име на бизнеса <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="businessName"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPhone">
                  Телефон <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="businessPhone"
                  required
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">
                  Имейл за контакт <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="businessEmail"
                  type="email"
                  required
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                />
              </div>
              {requirements.showCategoryTemplate ? (
                <div className="space-y-2">
                  <Label htmlFor="productNotes">
                    Продукти и бележки <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="productNotes"
                    required
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
              onChannelsChange={(next) =>
                setChannels(normalizeSocialChannels(next, minSocialChannels))
              }
              googleBusinessUrl={googleBusinessUrl}
              onGoogleBusinessUrlChange={setGoogleBusinessUrl}
            />
          ) : null}

          <div className="flex justify-between pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleBack} disabled={isFirstStep || saving}>
              Назад
            </Button>
            {!isLastStep ? (
              step === 2 || (step === 1 && !showStep1Continue) ? (
                <div />
              ) : (
                <Button type="button" onClick={handleNext} disabled={saving}>
                  {saving ? "Запазване..." : "Напред"}
                </Button>
              )
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
