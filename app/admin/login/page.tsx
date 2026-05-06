"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    try {
      const result = await signIn("admin", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Грешен имейл или парола");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Възникна грешка. Моля, опитайте отново.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="min-h-screen flex items-center justify-center bg-background p-4"
    >
      <Card data-auth-card className="w-full max-w-md bg-card border-border opacity-0 translate-y-10">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">
              Digi<span className="text-primary">Start</span>
            </span>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Администраторски панел
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Имейл</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@digistart.bg"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Парола</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </Field>

              <Button
                type="submit"
                size="lg"
                className="w-full glow-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                    Влизане...
                  </>
                ) : (
                  "Вход"
                )}
              </Button>
            </FieldGroup>
          </form>

          {/* <div className="mt-6 p-4 bg-secondary/50 rounded-lg">

          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
