import { BarChart3, Search, Star } from "lucide-react";
import Image from "next/image";
import { LandingSection } from "./shared";

const cardClassName =
  "flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 h-full";

function IconCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Search;
  title: string;
  description: string;
}) {
  return (
    <>
      <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden />
      </span>
      <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </>
  );
}

function ImageBottomCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <>
      <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
      <div className="relative mt-6 min-h-40 flex-1 w-full overflow-hidden rounded-xl sm:min-h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain object-bottom"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      </div>
    </>
  );
}

function ImageRightCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
      <div className="flex min-h-0 flex-1 flex-col lg:justify-center">
        <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      <div className="relative min-h-52 flex-1 overflow-hidden rounded-xl sm:min-h-60 lg:min-h-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}

function ImageLeftCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
      <div className="relative min-h-52 flex-1 overflow-hidden rounded-xl sm:min-h-60 lg:min-h-0 lg:max-w-[45%]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 45vw"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:justify-center">
        <h2 className="font-heading text-xl font-bold text-black">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

const MarketingTools = () => {
  return (
    <LandingSection id="marketing" className="bg-[#111111] text-white">
      <h1 className="max-w-3xl mx-auto text-4xl text-center">
        Продавай лесно с нашите вградени маркетинг инструменти
      </h1>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[minmax(11rem,1fr)_minmax(14rem,1fr)_auto] lg:auto-rows-fr">
        <li className={cardClassName}>
          <IconCard
            icon={Search}
            title="SEO оптимизиран"
            description="Всички секции и продукти са SEO оптимизирани"
          />
        </li>

        <li className={cardClassName}>
          <IconCard
            icon={BarChart3}
            title="Digi Analytics"
            description="Наши системи които проследяват клиентите ти за специализирано преживяване"
          />
        </li>

        <li className="flex flex-col gap-5 sm:col-span-2 lg:col-start-3 lg:row-span-2 lg:row-start-1">
          <article className={`${cardClassName} flex-1`}>
            <ImageBottomCard
              title="Промоции и намаления"
              description="На специфична дата сложи промоция или специфични секции да имат намаление"
              image="/marketing/promotion.png"
            />
          </article>
          <article className={cardClassName}>
            <IconCard
              icon={Star}
              title="Ревюта"
              description="При успешно направена поръчка клиентът получава имейл за ревю към google my business. Хората първо там проверяват дали е легитимен бизнеса"
            />
          </article>
        </li>

        <li className={`${cardClassName} sm:col-span-2 lg:col-span-2 lg:row-start-2`}>
          <ImageRightCard
            title="Имейл маркетинг"
            description="Събирай автоматично имейлите на клиентите които искат да се запишат за бюлетина. И автоматично пращане на имейли за персонализирани имейли или създаване на кампания"
            image="/marketing/newsletter.png"
          />
        </li>

        <li className={`${cardClassName} lg:col-span-3 lg:row-start-3`}>
          <ImageLeftCard
            title="Вградени тракери за проследяване"
            description="Готов за реклама и проследяване на клиентите ти от първи ден. Многокалано продаване като в google и meta"
            image="/marketing/social-media.png"
          />
        </li>
      </ul>
    </LandingSection>
  );
};

export default MarketingTools;
