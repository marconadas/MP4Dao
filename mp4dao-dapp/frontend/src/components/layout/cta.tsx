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
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="bg-primary py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pronto para proteger suas obras?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
            Junte-se aos artistas que já confiam na Mp4Dao para proteger 
            seus direitos autorais com tecnologia blockchain.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" variant="secondary" className="group" asChild>
              <Link href="/register">
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/works">
                Ver Exemplos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
