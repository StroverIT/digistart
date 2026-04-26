import { notFound } from "next/navigation";
import TransitionLink from "@/components/transitions/TransitionLink";
import { ArrowLeft, Clock, Check, Globe, ShoppingCart, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { services, getServiceBySlug } from "@/lib/data/services";
import { PricingConfigurator } from "@/components/services/pricing-configurator";
import type { Metadata } from "next";

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-12 w-12" />,
  ShoppingCart: <ShoppingCart className="h-12 w-12" />,
  MapPin: <MapPin className="h-12 w-12" />,
  Share2: <Share2 className="h-12 w-12" />,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DEDICATED_SERVICE_SLUGS = new Set(["готов-онлайн-магазин"]);

export async function generateStaticParams() {
  return services
    .filter((service) => !DEDICATED_SERVICE_SLUGS.has(service.slug))
    .map((service) => ({
      slug: service.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  
  if (!service) {
    return { title: "Услуга не е намерена" };
  }

  return {
    title: service.name,
    description: service.shortDescription,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back link */}
        <TransitionLink
          href="/#услуги"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Обратно към услугите
        </TransitionLink>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left - Service Info */}
          <div>
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {iconMap[service.icon]}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  {service.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.timeline}
                  </span>
                  <span>
                    от{" "}
                    <span className="text-primary font-semibold">
                      {service.basePrice} лв
                    </span>
                    {service.isMonthly && "/мес"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {service.fullDescription}
            </p>

            {/* Features */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Какво включва</h2>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Related Services */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Други услуги</h2>
              <div className="flex flex-wrap gap-2">
                {services
                  .filter((s) => s.id !== service.id)
                  .map((s) => (
                    <TransitionLink key={s.id} href={`/услуги/${s.slug}`}>
                      <Button variant="outline" size="sm">
                        {s.name}
                      </Button>
                    </TransitionLink>
                  ))}
              </div>
            </div>
          </div>

          {/* Right - Pricing Configurator */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PricingConfigurator service={service} />
          </div>
        </div>
      </div>
    </div>
  );
}
