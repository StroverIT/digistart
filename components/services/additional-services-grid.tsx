import Image from "next/image";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Card, CardContent } from "@/components/ui/card";
import { additionalServicePrompts } from "@/lib/cart/additional-services";
import type { Service } from "@/lib/types";

const serviceStickerMap: Record<string, string> = {
  "ai-automation": "/stickers/social-media.png",
  "ready-store": "/stickers/online-shop.png",
  "google-business": "/stickers/my-business.png",
  "social-media": "/stickers/social-media.png",
  ads: "/stickers/social-media.png",
};

function visibleAdditionalServices(services: Service[]) {
  return services.filter((service) => service.id !== "ai-automation");
}

function AdditionalServiceSticker({ service }: { service: Service }) {
  const src = serviceStickerMap[service.id];
  if (!src) return null;

  return (
    <div className="relative h-56 w-56 shrink-0 -my-10">
      <Image src={src} alt={`${service.name} sticker`} fill className="object-contain" sizes="5rem" />
    </div>
  );
}

export function AdditionalServicesGrid({
  services,
  title,
  description,
  ctaIdPrefix = "cart_upsell",
}: {
  services: Service[];
  title?: string;
  description?: string;
  ctaIdPrefix?: string;
}) {
  if (visibleAdditionalServices(services).length === 0) return null;

  return (
    <div>
      {title ? (
        <div className="mb-4 text-center sm:text-left">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-3 xl:grid-cols-2">
        {visibleAdditionalServices(services).map((service) => {
          const prompt = additionalServicePrompts[service.id];
          return (
            <div key={service.id} className="[&>span]:flex [&>span]:w-full">
              <TrackedCtaLink
                href={`/services/${service.slug}#booking`}
                ctaId={`${ctaIdPrefix}_${service.slug}`}
                className="flex flex-col  w-full items-center gap-2 xl:gap-4 rounded-xl border border-border bg-background/60 p-5 text-left transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <AdditionalServiceSticker service={service} />
                <div className="flex min-w-0 flex-1 flex-col gap-1 text-center xl:text-left">
                  <h3 className="text-base font-semibold leading-snug">{service.name}</h3>
                  {prompt ? (
                    <p className="text-sm font-medium leading-snug pt-1">{prompt}</p>
                  ) : null}
                </div>
              </TrackedCtaLink>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdditionalServicesUpsellCard({
  services,
  className,
  dataMarker,
  ctaIdPrefix = "cart_upsell",
}: {
  services: Service[];
  className?: string;
  dataMarker?: "cart" | "success";
  ctaIdPrefix?: string;
}) {
  if (visibleAdditionalServices(services).length === 0) return null;

  return (
    <Card
      {...(dataMarker === "cart" ? { "data-cart-additional-services": true } : {})}
      {...(dataMarker === "success" ? { "data-success-additional-services": true } : {})}
      className={`bg-card border-border ${className ?? ""}`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Може да ти бъде полезно още</h2>
          <p className="text-sm text-muted-foreground">
            Добави липсващите услуги, за да покриеш повече канали за продажби.
          </p>
        </div>
        {/* <AdditionalServicesGrid services={services} ctaIdPrefix={ctaIdPrefix} /> */}
      </CardContent>
    </Card>
  );
}
