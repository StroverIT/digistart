"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Check,
  LayoutTemplate,
  Package,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingIntegrationsStep } from "@/components/onboarding/onboarding-integrations-step";
import { OnboardingTemplatePicker } from "@/components/onboarding/onboarding-template-picker";
import { getOnboardingTemplates } from "@/lib/data/templates";
import {
  getActiveWizardSteps,
  getNextWizardStep,
  getPrevWizardStep,
  isProductSalesType,
  isValidUrl,
  normalizeSocialChannels,
  normalizeWizardStep,
  parseSocialChannelsFromSettings,
  PRODUCT_SALES_TYPES,
  type OnboardingRequirements,
  type ProductSalesType,
  type SocialChannelInput,
} from "@/lib/onboarding/requirements";
import { parseSelectedTemplateIds } from "@/lib/onboarding/selected-templates";
import { isWizardStepComplete } from "@/lib/onboarding/setup-steps";
import { PreviewLink } from "@/components/preview/preview-link";
import type { TenantProjectDto } from "@/lib/server/tenant-projects";
import { cn } from "@/lib/utils";

const WIZARD_STEP_ICONS: Record<number, LucideIcon> = {
  1: Package,
  2: LayoutTemplate,
  3: Building2,
  4: Share2,
};

const DEFAULT_REQUIREMENTS: OnboardingRequirements = {
  showCategoryTemplate: true,
  showTemplatePicker: true,
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
  templateId?: string | null;
  businessSettings?: Record<string, unknown>;
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
  const [productSalesType, setProductSalesType] = useState<ProductSalesType | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [productNotes, setProductNotes] = useState("");
  const [channels, setChannels] = useState<SocialChannelInput[]>([]);
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("");

  const activeSteps = useMemo(() => getActiveWizardSteps(requirements), [requirements]);
  const isLastStep = step === activeSteps[activeSteps.length - 1]?.id;
  const isFirstStep = step === activeSteps[0]?.id;
  const minSocialChannels = Math.max(requirements.socialChannelCount, 1);

  const hydrateFromProject = useCallback(
    (p: TenantProjectDto, req: OnboardingRequirements) => {
      setProject(p);
      setStep(normalizeWizardStep(p.onboardingStep || 1, req));
      const bs = p.businessSettings ?? {};
      const salesType = bs.productSalesType;
      setProductSalesType(isProductSalesType(salesType) ? salesType : null);
      setSelectedTemplateIds(parseSelectedTemplateIds(bs, p.templateId));
      setBusinessName(String(bs.businessName ?? ""));
      setProductNotes(String(bs.productNotes ?? ""));
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

  const buildBusinessSettings = (): Record<string, unknown> => ({
    businessName: businessName.trim(),
    productNotes: productNotes.trim(),
    ...(productSalesType ? { productSalesType } : {}),
    ...(selectedTemplateIds.length > 0 ? { selectedTemplateIds } : {}),
  });

  const buildTemplatePayload = (): Pick<SavePayload, "templateId" | "businessSettings"> => ({
    ...(selectedTemplateIds[0] ? { templateId: selectedTemplateIds[0] } : {}),
    businessSettings: buildBusinessSettings(),
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
    ...buildTemplatePayload(),
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
    const query = orderItemId ? `?orderItemId=${encodeURIComponent(orderItemId)}` : "";
    const res = await fetch(`/api/onboarding${query}`, {
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

  const validateProductSalesTypeStep = (): boolean => {
    if (!productSalesType) {
      toast.error("Моля, изберете тип продукти.");
      return false;
    }
    return true;
  };

  const validateBusinessStep = (): boolean => {
    if (!businessName.trim()) {
      toast.error("Моля, въведете име на бизнеса.");
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

  const handleProductSalesTypeSelect = (type: ProductSalesType) => {
    setProductSalesType(type);
    const next = getNextWizardStep(1, requirements);
    if (next == null) return;
    void advanceToStep(next, {
      businessSettings: {
        ...buildBusinessSettings(),
        productSalesType: type,
      },
    });
  };

  const handleTemplateToggle = (id: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const handleNext = async () => {
    if (step === 1 && !validateProductSalesTypeStep()) return;
    if (step === 2 && requirements.showTemplatePicker && selectedTemplateIds.length === 0) {
      toast.error("Моля, изберете поне един шаблон.");
      return;
    }
    if (step === 3 && !validateBusinessStep()) return;
    if (step === 4 && !validateSocialNetworks()) return;

    const next = getNextWizardStep(step, requirements);
    if (next == null) return;

    const payloadOverrides = step === 2 ? buildTemplatePayload() : undefined;
    const ok = await save(next, undefined, payloadOverrides);
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

  const templates = getOnboardingTemplates();
  const currentStepTitle = activeSteps.find((s) => s.id === step)?.title ?? "";
  const stepsCompleted = project?.onboardingStepsCompleted ?? {};

  const stepGridCols =
    activeSteps.length === 2
      ? "lg:grid-cols-2"
      : activeSteps.length === 3
        ? "lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-soft)] ring-1 ring-foreground/[0.04] md:rounded-[2.5rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
        />

        <div
          className={cn(
            "relative grid divide-y divide-border/50 lg:divide-x lg:divide-y-0",
            stepGridCols,
          )}
        >
          {activeSteps.map((s, idx) => {
            const isActive = step === s.id;
            const done =
              isWizardStepComplete(s.id, stepsCompleted, requirements) || step > s.id;
            const Icon = WIZARD_STEP_ICONS[s.id] ?? Package;

            return (
              <article
                key={s.id}
                className={cn(
                  "relative min-w-0 p-5 md:p-6",
                  isActive &&
                    "bg-gradient-to-br from-primary/20 via-primary/10 to-accent/[0.08] lg:shadow-[-12px_0_32px_-20px_oklch(0.32_0.16_320_/_0.18)]",
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-2 select-none font-heading text-5xl font-bold leading-none text-foreground/[0.04] md:right-5 md:top-3 md:text-6xl"
                >
                  0{idx + 1}
                </span>

                <div className="relative z-10">
                  <div
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-md ring-4 ring-card",
                      isActive || done
                        ? "bg-accent text-accent-foreground"
                        : "bg-accent/10 text-accent",
                    )}
                  >
                    {done && !isActive ? (
                      <Check className="h-4 w-4" strokeWidth={2.8} />
                    ) : (
                      <Icon className="h-4 w-4" strokeWidth={2.2} />
                    )}
                  </div>

                  <h3
                    className={cn(
                      "mt-4 font-heading text-sm font-bold leading-snug md:text-base",
                      isActive
                        ? "font-accent text-accent"
                        : done
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {s.title}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentStepTitle}</CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {step === 1 && requirements.showCategoryTemplate ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Какви продукти предлагате? Това ни помага да настроим магазина правилно.
              </p>
              {PRODUCT_SALES_TYPES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={saving}
                  onClick={() => handleProductSalesTypeSelect(option.id)}
                  className={cn(
                    "w-full text-left rounded-lg border p-4 transition-colors",
                    productSalesType === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="font-medium">{option.name}</span>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 && requirements.showTemplatePicker ? (
            <>
              <OnboardingTemplatePicker
                templates={templates}
                selectedIds={selectedTemplateIds}
                saving={saving}
                onToggle={handleTemplateToggle}
              />
              {selectedTemplateIds.length > 0 ? (
                <div className="sticky bottom-4 z-10 -mt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={saving}
                    className="shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    {saving ? "Запазване..." : "Напред"}
                  </Button>
                </div>
              ) : null}
            </>
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
              step === 1 || step === 2 ? (
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
