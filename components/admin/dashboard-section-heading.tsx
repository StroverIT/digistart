type DashboardSectionHeadingProps = {
  title: string;
  description?: string;
};

export function DashboardSectionHeading({ title, description }: DashboardSectionHeadingProps) {
  return (
    <div data-admin-animate>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
    </div>
  );
}
