import Image from "next/image";
import { LandingSection, LandingSectionTitle } from "./shared";

const RealShop = () => {
  return (
    <LandingSection id="real-shop" className="bg-muted/30">
      <h1 className="max-w-3xl mx-auto text-5xl text-center">
        Как реално изглежда готов онлайн магазин
      </h1>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg lg:order-1">
          <Image
            src="/restyled-mockup.png"
            alt="Real Shop"
            fill
            className="object-contain p-4"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="order-1 space-y-6 lg:order-2">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">Restyled</h2>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Преди: продаваше основно през директни разговори (чат и разговори). Всеки продукт
            изискваше неговото внимание - от това дали е наличен, има ли други размери. Опита се да
            скалира с 500 продукти и беше трудно
          </p>
          <p className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-base leading-relaxed text-foreground sm:p-6 sm:text-lg">
            След: Успява да прави по 3 поръчки на ден (90 поръчки на месец). Имат над 10000
            продукта и единствената му работа е да създава продукти и пакетира стоките за доставка
          </p>
        </div>
      </div>
    </LandingSection>
  );
};

export default RealShop;
