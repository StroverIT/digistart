/**
 * Full-page ambient layers for long service detail layouts (behind z-10 content).
 */
export function ServicePageBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-linear-to-tr from-transparent via-primary/5 to-chart-6/8" />
    </div>
  );
}
