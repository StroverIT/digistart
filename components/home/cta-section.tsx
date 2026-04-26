import TransitionLink from "@/components/transitions/TransitionLink";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteContact } from "@/lib/site-contact";

export function CTASection() {
  return (
    <section id="контакти" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <MessageCircle className="h-4 w-4" />
            Безплатна консултация
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">
            Готови да изградите вашето{" "}
            <span className="gradient-text">онлайн присъствие?</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Свържете се с нас за безплатна консултация. Ще обсъдим вашите нужди 
            и ще ви предложим най-доброто решение за вашия бизнес.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <TransitionLink href="/#услуги">
              <Button size="lg" className="glow-primary text-lg h-14 px-8">
                Разгледайте услугите
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </TransitionLink>
            <a href={`mailto:${siteContact.email}`}>
              <Button variant="outline" size="lg" className="text-lg h-14 px-8">
                {siteContact.email}
              </Button>
            </a>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Или ни се обадете на{" "}
            <a href={siteContact.phoneHref} className="text-primary hover:underline">
              {siteContact.phoneLabel}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
