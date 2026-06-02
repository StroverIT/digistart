import { Star } from "lucide-react";

const GOOGLE_MAPS_REVIEWS_URL =
  "https://www.google.com/maps/place/Digistart/@42.6463351,23.4062764,17z/data=!3m1!4b1!4m6!3m5!1s0x6de45c7a12e65d4d:0x34419d40aa2064bc!8m2!3d42.6463351!4d23.4088513!16s%2Fg%2F11j_1z1tcr?entry=ttu&g_ep=EgoyMDI2MDUyNy4wIKXMDSoASAFQAw%3D%3D";

const stars = Array.from({ length: 5 });

const HeroReviewBadge = () => {
  return (
    <article className="w-full rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Google Reviews</p>

        <div className="mt-4 flex items-center gap-1" aria-label="5 от 5 звезди">
          {stars.map((_, index) => (
            <Star key={index} className="h-6 w-6 text-yellow-400" fill="currentColor" />
          ))}
        </div>

        <p className="mt-3 text-3xl font-bold sm:text-4xl">5.0 / 5.0</p>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          Рейтингът е базиран на публичните отзиви в Google Maps за DigiStart.
        </p>

        <a
          href={GOOGLE_MAPS_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Виж ревютата в Google Maps
        </a>
      </div>
    </article>
  );
};

export default HeroReviewBadge;
