"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CookieConsentState = {
  functional: true;
  ads: boolean;
  updatedAt: string;
};

const COOKIE_CONSENT_KEY = "digistart_cookie_consent_v1";

function readConsent(): CookieConsentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CookieConsentState;
  } catch {
    return null;
  }
}

function saveConsent(consent: CookieConsentState) {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
}

export function CookieConsent() {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(false);

  useEffect(() => {
    const consent = readConsent();
    if (consent) {
      setAdsEnabled(Boolean(consent.ads));
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
    setIsReady(true);
  }, []);

  const consentPayload = useMemo(
    () => ({
      functional: true as const,
      ads: adsEnabled,
      updatedAt: new Date().toISOString(),
    }),
    [adsEnabled]
  );

  if (!isReady || !isOpen) {
    return null;
  }

  const handleAcceptAll = () => {
    const next = { ...consentPayload, ads: true };
    saveConsent(next);
    setAdsEnabled(true);
    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleConfirmSelection = () => {
    saveConsent(consentPayload);
    setIsOpen(false);
    setShowPreferences(false);
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm text-foreground">
              Използваме бисквитки, за да подобрим функционалността на сайта и да
              анализираме трафика. Можете да приемете всички или да изберете кои
              категории да разрешите.
            </p>
            <Link
              href="/cookies-policy"
              className="mt-1 inline-flex text-sm text-primary hover:text-primary/80 underline transition-colors"
            >
              Прочетете политиката за бисквитки
            </Link>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Персонализирай
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Приеми всички
            </button>
          </div>
        </div>
      </div>

      {showPreferences ? (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-foreground/40 p-4 sm:items-center">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground">
              Настройки за бисквитки
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Необходимите бисквитки винаги са активни, защото сайтът не може да
              работи без тях.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Функционални</p>
                    <p className="text-sm text-muted-foreground">
                      Задължителни за нормалната работа на сайта.
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Винаги активни
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">
                      Рекламни и аналитични
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Позволяват персонализирано съдържание и измерване на
                      ефективността.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={adsEnabled}
                    aria-label="Разрешаване на рекламни и аналитични бисквитки"
                    onClick={() => setAdsEnabled((current) => !current)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      adsEnabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        adsEnabled ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Приеми всички
              </button>
              <button
                type="button"
                onClick={handleConfirmSelection}
                className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                Запази избора
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
