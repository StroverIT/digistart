"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTemplate } from "@/lib/data/templates";
import { PreviewLink } from "@/components/preview/preview-link";
import { cn } from "@/lib/utils";

interface DemoPageProps {
  params: { category: string; id: string };
}

export default function DemoPage({ params }: DemoPageProps) {
  const template = getTemplate(params.category, params.id);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  if (!template) notFound();

  return (
    <main className="pt-24 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
          <p className="text-muted-foreground mb-6">{template.description}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant={device === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("desktop")}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
            <Button
              type="button"
              variant={device === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("mobile")}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
            <PreviewLink
              href={template.previewPath}
              ctaId={`demo_open_${params.category}_${params.id}`}
              ctaPage={template.demoPath}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
            >
              Отвори на цял екран
            </PreviewLink>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            className={cn(
              "rounded-xl border border-border bg-muted/30 overflow-hidden shadow-2xl transition-all duration-300",
              device === "desktop" ? "w-full max-w-5xl aspect-[16/10]" : "w-[375px] aspect-[9/19]",
            )}
          >
            <iframe
              title={template.name}
              src={template.previewPath}
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
