import { Shield, Lock, Users, FileText, Gavel, Globe } from 'lucide-react';

const features = [
  {
    name: 'Registo Blockchain',
    description: 'Suas obras são registadas na blockchain Polygon, garantindo imutabilidade e prova de anterioridade.',
    icon: Shield,
  },
  {
    name: 'Privacidade Total',
    description: 'Ficheiros encriptados com AES-256. Apenas você tem acesso aos conteúdos originais.',
    icon: Lock,
  },
  {
    name: 'Coautoria',
    description: 'Sistema avançado de gestão de coautores com splits percentuais automáticos.',
    icon: Users,
  },
  {
    name: 'Certificados Digitais',
    description: 'Certificados PDF profissionais com QR codes para verificação instantânea.',
    icon: FileText,
  },
  {
    name: 'Resolução de Disputas',
    description: 'Sistema integrado de mediação para resolver conflitos de forma rápida e justa.',
    icon: Gavel,
  },
  {
    name: 'Conformidade Legal',
    description: 'Totalmente compatível com a Lei n.º 15/14 de Angola e tratados internacionais.',
    icon: Globe,
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Funcionalidades Avançadas
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tudo que precisa para proteger sua música
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Nossa plataforma oferece todas as ferramentas necessárias para registar, 
            proteger e gerir os direitos das suas obras musicais.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
