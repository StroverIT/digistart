const stats = [
  { value: "2+", label: "Успешни проекта" },
  { value: "2+", label: "Доволни клиенти" },
  { value: "8+", label: "Години опит" },
  { value: "100%", label: "Удовлетвореност" },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-primary/5 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
