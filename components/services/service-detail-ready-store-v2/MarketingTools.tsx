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
    <div className="flex h-full min-h-0 flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8 lg:gap-10">
      <div className="relative min-h-52 w-full min-w-0 flex-1 overflow-hidden rounded-xl sm:min-h-48 lg:min-h-48 xl:min-h-56">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain object-left"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col sm:justify-center">
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

      <ul className="mt-12 grid w-full list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[minmax(11rem,1fr)_minmax(14rem,1fr)_auto] lg:[grid-template-areas:'seo_analytics_promo'_'email_email_promo'_'trackers_trackers_trackers']">
        <li className={`${cardClassName} lg:[grid-area:seo]`}>
          <IconCard
            icon={Search}
            title="SEO оптимизиран"
            description="Изкачвай се в органичното търсене. Всичко е SEO оптимизирано още при пускането на онлайн магазина"
          />
        </li>

        <li className={`${cardClassName} lg:[grid-area:analytics]`}>
          <IconCard
            icon={BarChart3}
            title="Digi Analytics"
            description="Над 40% от данните се губят в meta pixel, google analytics, google tag manager и други системи. Затова изградихме вътрешна система за 100% точност"
          />
        </li>

        <li className="flex flex-col gap-5 sm:col-span-2 lg:[grid-area:promo]">
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

        <li className={`${cardClassName} sm:col-span-2 lg:[grid-area:email]`}>
          <ImageRightCard
            title="Имейл маркетинг"
            description="Събирай автоматично имейлите на клиентите които искат да се запишат за бюлетина. И автоматично пращане на имейли за персонализирани имейли или създаване на кампания"
            image="/marketing/newsletter.png"
          />
        </li>

        <li className={`${cardClassName} w-full sm:col-span-2 lg:[grid-area:trackers] lg:min-h-56 xl:min-h-64`}>
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
