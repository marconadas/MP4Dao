import { Hero } from '@/components/layout/hero';
import { Features } from '@/components/layout/features';
import { Stats } from '@/components/layout/stats';
import { HowItWorks } from '@/components/layout/how-it-works';
import { Testimonials } from '@/components/layout/testimonials';
import { CTA } from '@/components/layout/cta';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Stats />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
