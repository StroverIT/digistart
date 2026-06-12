"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { UpsellConfigurator } from "@/components/services/upsell-configurator";
import type { UpsellEntryErrors } from "@/components/services/upsell-validation";
import type { CartItemUpsell, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ServiceUpsellsSectionProps {
  service: Service;
  upsells: CartItemUpsell[];
  onUpsellsChange: (nextUpsells: CartItemUpsell[]) => void;
  hiddenUpsellIds?: string[];
  prefixContent?: ReactNode;
  customUpsellsContent?: ReactNode;
  collapsible?: boolean;
  errors?: UpsellEntryErrors;
  analyticsPage?: string;
  className?: string;
}

export function ServiceUpsellsSection({
  service,
  upsells,
  onUpsellsChange,
  hiddenUpsellIds = [],
  prefixContent,
  customUpsellsContent,
  collapsible = false,
  errors,
  analyticsPage,
  className,
}: ServiceUpsellsSectionProps) {
  const [expanded, setExpanded] = useState(!collapsible);
  const upsellsWrapperRef = useRef<HTMLDivElement | null>(null);
  const upsellsContentRef = useRef<HTMLDivElement | null>(null);
  const prevExpandedRef = useRef(expanded);

  const visibleUpsells = useMemo(
    () => service.upsells.filter((upsell) => !hiddenUpsellIds.includes(upsell.id)),
    [hiddenUpsellIds, service.upsells],
  );

  const hasUpsellConfigurator = visibleUpsells.length > 0;
  const hasUpsellContent = Boolean(prefixContent || customUpsellsContent || hasUpsellConfigurator);

  useEffect(() => {
    if (!collapsible || !hasUpsellContent) return;

    const wrapper = upsellsWrapperRef.current;
    if (!wrapper) return;

    gsap.set(wrapper, { height: 0, autoAlpha: 0, display: "none" });
  }, [collapsible, hasUpsellContent, service.id]);

  useEffect(() => {
    if (!collapsible || !hasUpsellContent) return;

    const wrapper = upsellsWrapperRef.current;
    const content = upsellsContentRef.current;
    if (!wrapper || !content) return;

    const expandedChanged = prevExpandedRef.current !== expanded;
    prevExpandedRef.current = expanded;
    if (!expandedChanged) return;

    gsap.killTweensOf(wrapper);

    if (expanded) {
      gsap.set(wrapper, { display: "block" });
      gsap.fromTo(
        wrapper,
        { height: 0, autoAlpha: 0 },
        {
          height: content.scrollHeight,
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => gsap.set(wrapper, { height: "auto" }),
        },
      );
      return;
    }

    gsap.fromTo(
      wrapper,
      { height: wrapper.offsetHeight, autoAlpha: 1 },
      {
        height: 0,
        autoAlpha: 0,
        duration: 0.24,
        ease: "power2.in",
        onComplete: () => gsap.set(wrapper, { display: "none" }),
      },
    );
  }, [collapsible, expanded, hasUpsellContent, service.id]);

  useEffect(() => {
    if (!collapsible || !expanded || !hasUpsellContent) return;

    const wrapper = upsellsWrapperRef.current;
    if (!wrapper) return;

    gsap.set(wrapper, { display: "block", height: "auto", autoAlpha: 1 });
  }, [collapsible, expanded, hasUpsellContent, upsells, service.id]);

  if (!hasUpsellContent) {
    return null;
  }

  const upsellBody = (
    <div className="space-y-4">
      {prefixContent}
      {customUpsellsContent}
      {hasUpsellConfigurator ? (
        <UpsellConfigurator
          service={{ ...service, upsells: visibleUpsells }}
          value={upsells}
          onChange={onUpsellsChange}
          errors={errors}
          analyticsPage={analyticsPage ?? `/services/${service.slug}`}
        />
      ) : null}
    </div>
  );

  if (collapsible) {
    return (
      <div className={cn("mt-3 border-t border-border pt-3", className)}>
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full cursor-pointer justify-between px-0 py-1 text-sm font-medium hover:bg-transparent hover:text-primary"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          <span>Допълнителни функционалности</span>
          <span className="flex items-center gap-2 text-muted-foreground">
            {expanded ? "Скрий" : "Покажи"}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            />
          </span>
        </Button>
        <div ref={upsellsWrapperRef} className="mt-2 overflow-hidden">
          <div ref={upsellsContentRef}>{upsellBody}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="mb-3 font-semibold">Допълнителни функционалности</h3>
      {upsellBody}
    </div>
  );
}
