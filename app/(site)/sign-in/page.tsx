"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import gsap from "gsap";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import {
  GoogleSignInButton,
} from "@/components/auth/google-sign-in-button";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/user";
  const safeCallbackUrl = callbackUrl.startsWith("/") ? callbackUrl : "/user";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    const card = root.querySelector<HTMLElement>("[data-auth-card]");
    if (!card) return;

    const ctx = gsap.context(() => {
      gsap.set(card, { opacity: 0, y: 40, scale: 0.97 });
      gsap.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.5)" });
    }, root);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("customer", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Грешен имейл или парола.");
        setLoading(false);
        return;
      }
      router.push(safeCallbackUrl);
      router.refresh();
    } catch {
      setError("Възникна грешка.");
      setLoading(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="pt-24 pb-16 min-h-[70vh] flex items-center justify-center px-4"
    >
      <Card data-auth-card className="w-full max-w-md bg-card border-border opacity-0 translate-y-10">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <GoogleSignInButton callbackUrl={safeCallbackUrl} label="Вход с Google" />
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                или с имейл
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Имейл</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Парола</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
              <Button type="submit" className="w-full glow-primary" disabled={loading}>
                {loading ? "Влизане..." : "Вход с имейл"}
              </Button>
            </FieldGroup>
          </form>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Нямате акаунт?{" "}
            <TrackedCtaLink href="/sign-up" ctaId="signin_to_signup" className="text-primary hover:underline">
              Регистрация
            </TrackedCtaLink>
          </p>
          <TrackedCtaLink
            href="/"
            ctaId="signin_back_home"
            className="block text-center text-sm text-muted-foreground mt-2 hover:text-foreground"
          >
            Към началото
          </TrackedCtaLink>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 flex justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
