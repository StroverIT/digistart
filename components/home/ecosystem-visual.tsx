import {
  MapPin,
  Megaphone,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

const nodes = [
  { icon: ShoppingBag, label: "Онлайн магазин", className: "top-0 left-1/2 -translate-x-1/2" },
  { icon: Megaphone, label: "Реклами", className: "top-1/4 right-0" },
  { icon: Truck, label: "Доставка", className: "bottom-1/4 right-0" },
  { icon: MapPin, label: "Google Maps", className: "bottom-0 left-1/2 -translate-x-1/2" },
  { icon: MessageCircle, label: "Соц. мрежи", className: "bottom-1/4 left-0" },
  { icon: Sparkles, label: "Съдържание", className: "top-1/4 left-0" },
];

export function EcosystemVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px]">
      <div className="absolute inset-8 rounded-full border-2 border-dashed border-primary/20" />
      <div className="absolute inset-16 rounded-full border-2 border-dashed border-primary/15" />

      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
        <span className="font-heading text-xs uppercase tracking-widest text-primary-foreground/80">
          DigiStart
        </span>
        <span className="mt-1 font-heading text-2xl font-bold">360°</span>
      </div>

      {nodes.map(({ icon: Icon, label, className }) => (
        <div
          key={label}
          className={`absolute ${className} flex h-20 w-20 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-border bg-card p-2 text-center shadow-[var(--shadow-soft)]`}
        >
          <Icon className="h-5 w-5 text-primary" strokeWidth={2.2} />
          <span className="mt-1 text-[10px] font-semibold leading-tight text-foreground">
            {label}
          </span>
        </div>
      ))}

      <div className="absolute -left-10 -top-10 -z-10 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-10 -right-10 -z-10 h-40 w-40 rounded-full bg-chart-6/30 blur-3xl" />
    </div>
  );
}
