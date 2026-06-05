"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { VisitorSurvey } from "@/components/visitor-survey/visitor-survey";
import { getServicePath } from "@/lib/visitor-preferences/paths";
import {
  getPreferences,
  hasCompletedSurvey,
  parseVisitorServiceId,
} from "@/lib/visitor-preferences/storage";
import {
  isHomeRedirectSuppressed,
  releaseHomeRedirectSuppression,
} from "@/lib/visitor-preferences/navigation";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";

function HomePageClientInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "1";
  const chosenService = parseVisitorServiceId(searchParams.get("chosenService"));
  const { push } = useTransitionRouter();
  const [ready, setReady] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyEditMode, setSurveyEditMode] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      releaseHomeRedirectSuppression();
    }
  }, [pathname]);

  useEffect(() => {
    if (isEditMode) {
      setSurveyEditMode(true);
      setShowSurvey(true);
      setReady(true);
      return;
    }

    if (isHomeRedirectSuppressed()) {
      setSurveyEditMode(hasCompletedSurvey());
      setShowSurvey(true);
      setReady(true);
      return;
    }

    if (hasCompletedSurvey()) {
      const prefs = getPreferences();
      if (prefs) {
        push(getServicePath(prefs.primaryService));
        return;
      }
    }

    setShowSurvey(true);
    setReady(true);
  }, [isEditMode, push]);

  if (!ready) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!showSurvey) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <VisitorSurvey
      isEditMode={isEditMode || surveyEditMode}
      chosenService={isEditMode ? undefined : chosenService ?? undefined}
    />
  );
}

export function HomePageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <HomePageClientInner />
    </Suspense>
  );
}
