const stats = [
  { id: 1, name: 'Obras Registadas', value: '1,200+' },
  { id: 2, name: 'Artistas Ativos', value: '350+' },
  { id: 3, name: 'Disputas Resolvidas', value: '98%' },
  { id: 4, name: 'Tempo Médio de Registo', value: '<2min' },
];

export function Stats() {
  return (
    <section className="bg-primary-50/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Confiado por artistas em toda Angola
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Números que demonstram o impacto da Mp4Dao na proteção da música angolana
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col bg-primary-400/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-muted-foreground">
                  {stat.name}
                </dt>
                <dd className="order-first text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
