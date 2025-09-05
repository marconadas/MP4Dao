import { Upload, Shield, FileCheck, Award } from 'lucide-react';

const steps = [
  {
    name: 'Upload Seguro',
    description: 'Carregue suas obras musicais com encriptação automática AES-256',
    icon: Upload,
  },
  {
    name: 'Registo Blockchain',
    description: 'Criamos um hash único e registamos na blockchain Polygon',
    icon: Shield,
  },
  {
    name: 'Verificação',
    description: 'Sistema verifica a integridade e gera prova de anterioridade',
    icon: FileCheck,
  },
  {
    name: 'Certificado Digital',
    description: 'Receba seu certificado oficial com QR code de verificação',
    icon: Award,
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Processo simples e seguro em 4 passos
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4">
            {steps.map((step, stepIdx) => (
              <div key={step.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <step.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {step.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">{step.description}</dd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
