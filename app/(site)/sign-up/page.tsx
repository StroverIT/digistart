"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Паролата трябва да е поне 8 символа.");
      return;
    }
    if (password !== password2) {
      setError("Паролите не съвпадат.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim() || undefined,
          password,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Регистрацията не бе успешна.");
        setLoading(false);
        return;
      }
      const sign = await signIn("customer", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (sign?.error) {
        setError("Акаунтът е създаден, но входът не бе успешен. Опитайте от страницата за вход.");
        setLoading(false);
        return;
      }
      router.push("/user");
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
          <CardTitle>Регистрация</CardTitle>
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
                <FieldLabel htmlFor="name">Име *</FieldLabel>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Имейл *</FieldLabel>
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
                <FieldLabel htmlFor="phone">Телефон *</FieldLabel>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="company">Фирма</FieldLabel>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Парола *</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password2">Потвърди парола *</FieldLabel>
                <Input
                  id="password2"
                  type="password"
                  autoComplete="new-password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />
              </Field>
              <Button type="submit" className="w-full glow-primary" disabled={loading}>
                {loading ? "Регистрация..." : "Създай акаунт"}
              </Button>
            </FieldGroup>
          </form>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Вече имате акаунт?{" "}
            <TrackedCtaLink href="/sign-in" ctaId="signup_to_signin" className="text-primary hover:underline">
              Вход
            </TrackedCtaLink>
          </p>
          <TrackedCtaLink
            href="/"
            ctaId="signup_back_home"
            className="block text-center text-sm text-muted-foreground mt-2 hover:text-foreground"
          >
            Към началото
          </TrackedCtaLink>
        </CardContent>
      </Card>
    </div>
  );
}
