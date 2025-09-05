import { Metadata } from 'next';
import { RegisterWorkForm } from '@/components/works/register-work-form';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Registar Obra | MP4 DAO',
  description: 'Registe a sua obra musical na blockchain de forma segura e permanente.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Registar Nova Obra Musical
            </h1>
            <p className="text-muted-foreground text-lg">
              Proteja os seus direitos autorais registando a sua obra na blockchain.
              O registo é permanente, imutável e reconhecido legalmente em Angola.
            </p>
          </div>
          
          <RegisterWorkForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
