import ConsultationBookingForm from "@/components/consultation/consultation-booking-form";
import { siteContact } from "@/lib/site-contact";
import Image from "next/image";
import {
  BrainCircuit,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

type TeamMember = {
  name: string;
  role: string;
  description: string;
  image?: string;
};

const teamMembers: TeamMember[] = [
  {
    name: "Емил",
    role: "CEO, Програмист и Дизайнер",
    description:
      "Техническият двигател на агенцията. Емил превръща сложния код и дизайн в красиви, бързи и лесни за управление онлайн магазини. Той е човекът, който се грижи сайтът ти да работи перфектно, докато ти спиш.",
    image: "/people/emil.png",
  },
  {
    name: "Ния",
    role: "Маркетинг мениджър и Content Creator",
    description:
      "Гласът и стратегията. Ния знае точно как да представи продуктите ти пред правилните хора. Тя създава съдържанието и рекламите, които превръщат случайните посетители в лоялни клиенти.",
    image: "/people/nia.png",
  },
];

const whyChooseUs = [
  {
    title: "Над 10 години комбиниран опит",
    description:
      "Видели сме много. Сблъсквали сме се с всякакви технически и маркетингови предизвикателства и знаем точно кое работи и кое - не. Не експериментираме с твоя бизнес, а прилагаме доказани практики.",
    icon: Clock3,
  },
  {
    title: "Дълбока техническа експертиза",
    description:
      "Ние не просто \"сглобяваме\" сайтове. Разбираме архитектурата зад тях. Това ни позволява да създаваме решения, които са бързи, сигурни и лесни за надграждане.",
    icon: BrainCircuit,
  },
  {
    title: "Говорим на твоя език",
    description:
      "Имаме огромен опит в комуникацията с клиенти. Забрави за неразбираемия IT жаргон. Обясняваме всичко просто, ясно и прозрачно, уважавайки твоето време.",
    icon: MessageCircle,
  },
] as const;

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 md:pt-28 md:pb-24">
      <div className="container mx-auto px-4 space-y-16 md:space-y-20">
        <section className="max-w-4xl mx-auto text-center space-y-5">
          <p className="text-sm font-medium tracking-wide uppercase text-primary">
            Без сложни термини. Само реални хора.
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Кои сме ние и как да се свържеш с нас? ⚡
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Ние сме екипът, който помага на малки бизнеси, странични проекти и създатели да
            стартират онлайн без излишна сложност.
          </p>
        </section>

        <section className="max-w-4xl mx-auto rounded-2xl border border-border bg-card p-6 sm:p-8 md:p-10 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold">Нашата мисия 🚀</h2>
          <p className="text-muted-foreground leading-relaxed">
            Вярваме, че добра идея не трябва да чака бюджет от хиляди евро, за да стигне до
            първите си клиенти. Нашата цел е да ти дадем бърз, ясен и бюджетен онлайн старт, за да
            тестваш пазара, да намалиш ръчната работа и да продаваш по-спокойно.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center">
            Хората зад кода и рекламите
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="rounded-2xl border border-border bg-white p-6 md:p-7"
              >
                <div className="flex flex-col gap-4 md:gap-5">
                  <div
                    className="relative mx-auto h-40 w-40 lg:h-96 lg:w-96"
                    aria-hidden={member.image ? undefined : true}
                  >
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={`Илюстрация на ${member.name}`}
                        fill
                        className="object-contain object-top"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-primary">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-sm font-medium text-primary">{member.role}</p>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Защо да ни се довериш? 🤝
            </h2>
            <p className="text-muted-foreground">
              Ние сме нова агенция, но далеч не сме нови в занаята.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-6 space-y-4"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-wide uppercase text-primary">
                Контакти
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold">
                Пиши ни, ако искаш ясен план за растеж
              </h2>
              <p className="text-muted-foreground">
                Сподели накратко за твоя магазин, а ние ще ти върнем конкретни
                следващи стъпки без излишна сложност.
              </p>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <a
                  href={`mailto:${siteContact.email}`}
                  className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                >
                  {siteContact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <a
                  href={siteContact.phoneHref}
                  className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                >
                  {siteContact.phoneLabel}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">
                  София, България
                </span>
              </li>
            </ul>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteContact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={siteContact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={siteContact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <ConsultationBookingForm
            source="public"
            title="Свържи се с нас"
            description="Избери удобен ден и час, остави контакт и ще се чуем с конкретни идеи за твоя бизнес."
            submitLabel="Изпрати запитване"
          />
        </section>
      </div>
    </div>
  );
}
