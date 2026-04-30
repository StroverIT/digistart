"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/user";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      router.push(callbackUrl.startsWith("/") ? callbackUrl : "/user");
      router.refresh();
    } catch {
      setError("Възникна грешка.");
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
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
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <Button type="submit" className="w-full glow-primary" disabled={loading}>
                {loading ? "Влизане..." : "Вход"}
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
