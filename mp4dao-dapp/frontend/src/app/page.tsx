/**
 * MP4 DAO - Plataforma de Registo de Copyright Musical em Angola
 * 
 * Copyright (c) 2024 Marcos de Jesus Araújo Cândido dos Santos
 * Rua Luís Simões 55A 2ºEsq, Pendão, Queluz, 2745-035, Lisboa
 * 
 * This file is part of the MP4 DAO project.
 * 
 * Licensed under the MIT License. See LICENSE file for details.
 */
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
