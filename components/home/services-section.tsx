import Link from "next/link";
import { Globe, ShoppingCart, MapPin, Share2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/data/services";

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-8 w-8" />,
  ShoppingCart: <ShoppingCart className="h-8 w-8" />,
  MapPin: <MapPin className="h-8 w-8" />,
  Share2: <Share2 className="h-8 w-8" />,
};

export function ServicesSection() {
  return (
    <section id="услуги" className="py-20 md:py-28 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Нашите услуги
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">
            Всичко необходимо за вашия{" "}
            <span className="gradient-text">онлайн успех</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            От професионални уеб сайтове до пълно управление на социални мрежи - 
            предлагаме комплексни решения за дигиталното присъствие на вашия бизнес.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service) => (
            <Card
              key={service.id}
              className="group bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col h-full">
                  {/* Icon */}
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    {iconMap[service.icon]}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3">{service.name}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                    {service.shortDescription}
                  </p>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-sm text-muted-foreground">от</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary">
                          {service.basePrice}
                        </span>
                        <span className="text-muted-foreground">
                          {service.isMonthly ? "лв/мес" : "лв"}
                        </span>
                      </div>
                    </div>
                    <Link href={`/услуги/${service.slug}`}>
                      <Button
                        variant="ghost"
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        Научете повече
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
