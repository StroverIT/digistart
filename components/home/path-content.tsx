import { AlertTriangle, Check, Flame, Lightbulb } from "lucide-react";
import type { PathContent as PathContentType } from "@/lib/data/home-paths";
import { cn } from "@/lib/utils";

function splitSentences(text: string) {
  return text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [text];
}

const blocks = [
  {
    key: "problem",
    title: "Проблемът",
    icon: AlertTriangle,
  },
  {
    key: "agitate",
    title: "Защо това е сериозно",
    icon: Flame,
  },
  {
    key: "solution",
    title: "Нашето решение",
    icon: Lightbulb,
  },
] as const;

export function PathContent({ path }: { path: PathContentType }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {blocks.map((b, idx) => {
        const text = path[b.key as "problem" | "agitate" | "solution"];
        const isSolution = b.key === "solution";
        return (
          <article
            key={b.key}
            className={`relative rounded-3xl border p-7 ${
              isSolution
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card"
            }`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                isSolution
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <b.icon className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="mt-5 text-xs font-bold uppercase tracking-widest opacity-70">
              0{idx + 1}
            </div>
            <h3 className="mt-1 font-heading text-xl font-bold">{b.title}</h3>
            <p
              className={`mt-3 text-sm leading-relaxed ${
                isSolution ? "text-primary-foreground/90" : "text-muted-foreground"
              }`}
            >
              {splitSentences(text).map((sentence, sentenceIdx) => (
                <span
                  key={sentenceIdx}
                  className={cn("block", sentenceIdx > 0 && "mt-3")}
                >
                  {sentence}
                </span>
              ))}
            </p>
          </article>
        );
      })}

      <div className="lg:col-span-3">
        <div className="mt-4 rounded-3xl border border-border bg-card p-8 md:p-10">
          <h3 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
            {path.fitTitle}
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {path.fits.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-2xl border border-border/70 bg-background p-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Check className="h-5 w-5" strokeWidth={3} />
                </div>
                <div>
                  <div className="font-heading font-bold text-foreground">{f.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
