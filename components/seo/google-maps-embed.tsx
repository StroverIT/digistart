import { siteContact } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

type GoogleMapsEmbedProps = {
  className?: string;
  title?: string;
  /** Shorter map for footer / sidebars */
  compact?: boolean;
  /** Stretch iframe to the wrapper height (use with a sized/h-full parent) */
  fill?: boolean;
  /** Hide the NAP strip under the iframe */
  hideCaption?: boolean;
};

export function GoogleMapsEmbed({
  className,
  title = `${siteContact.businessName} на картата`,
  compact = false,
  fill = false,
  hideCaption = false,
}: GoogleMapsEmbedProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        fill && "flex h-full min-h-44 flex-col",
        className,
      )}
    >
      <iframe
        title={title}
        src={siteContact.googleMapsEmbedUrl}
        className={cn(
          "w-full border-0",
          fill ? "min-h-44 flex-1" : compact ? "h-40 md:h-44" : "h-64 md:h-80",
        )}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {!hideCaption ? (
        <div className="flex flex-col gap-1 border-t border-border/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {siteContact.businessName}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {siteContact.addressSingleLine}
            </p>
          </div>
          <a
            href={siteContact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm font-medium text-accent hover:underline"
          >
            Отвори в Google Maps
          </a>
        </div>
      ) : null}
    </div>
  );
}
