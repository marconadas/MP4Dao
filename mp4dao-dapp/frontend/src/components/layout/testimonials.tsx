const testimonials = [
  {
    name: 'Ana Silva',
    role: 'Cantora e Compositora',
    content: 'Mp4Dao revolucionou como protejo minhas músicas. Agora tenho certeza legal e tecnológica.',
    avatar: '/images/avatar-1.jpg',
  },
  {
    name: 'João Santos',
    role: 'Produtor Musical',
    content: 'Processo rápido e seguro. Em menos de 2 minutos tenho meu certificado digital.',
    avatar: '/images/avatar-2.jpg',
  },
  {
    name: 'Maria Costa',
    role: 'Artista Independente',
    content: 'Finalmente posso registar minhas obras sem burocracias. Tecnologia ao serviço da arte.',
    avatar: '/images/avatar-3.jpg',
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            O que dizem os artistas
          </h2>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl bg-background p-8 shadow-sm ring-1 ring-border"
              >
                <blockquote className="text-muted-foreground">
                  <p>"{testimonial.content}"</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </figcaption>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
