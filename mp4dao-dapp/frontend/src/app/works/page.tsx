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
import { Metadata } from 'next';
import { MyWorksPage } from '@/components/works/my-works-page';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Minhas Obras | MP4 DAO',
  description: 'Gerir as suas obras musicais registadas na blockchain.',
};

export default function WorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Minhas Obras Registadas
            </h1>
            <p className="text-muted-foreground text-lg">
              Visualize e gerir todas as suas obras musicais registadas na blockchain.
            </p>
          </div>
          
          <MyWorksPage />
        </div>
      </main>
      <Footer />
    </div>
  );
}
