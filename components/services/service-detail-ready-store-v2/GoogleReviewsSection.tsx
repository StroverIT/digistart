import { Star } from "lucide-react";
import { LANDING_CARD_CLASS } from "./landing-animation-classes";

const GOOGLE_MAPS_REVIEWS_URL =
  "https://www.google.com/maps/place/Digistart/@42.6463351,23.4062764,17z/data=!3m1!4b1!4m6!3m5!1s0x6de45c7a12e65d4d:0x34419d40aa2064bc!8m2!3d42.6463351!4d23.4088513!16s%2Fg%2F11j_1z1tcr?entry=ttu&g_ep=EgoyMDI2MDUyNy4wIKXMDSoASAFQAw%3D%3D";

const stars = Array.from({ length: 5 });

const GoogleReviewsSection = () => {
  return (
    <article
      data-animate-card
      className={`mx-auto mb-10 mt-4 w-full max-w-3xl rounded-2xl border border-border/80 bg-white from-muted/50 to-background px-6 py-10 text-center shadow-sm sm:px-10 ${LANDING_CARD_CLASS}`}
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Google Reviews</p>

      <div className="mt-4 flex items-center justify-center gap-1" role="img" aria-label="5 от 5 звезди">
        {stars.map((_, index) => (
          <Star key={index} className="size-7 text-amber-400" fill="currentColor" />
        ))}
      </div>

      <p className="mt-3 font-heading text-4xl font-bold sm:text-5xl">5.0 / 5.0</p>
      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
        Рейтингът е базиран на публичните отзиви в Google My Business.
      </p>

      <a
        href={GOOGLE_MAPS_REVIEWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Виж ревютата в Google Maps
      </a>
    </article>
  );
};

export default GoogleReviewsSection;
