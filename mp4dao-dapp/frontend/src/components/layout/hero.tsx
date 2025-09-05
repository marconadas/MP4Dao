'use client';

import Link from 'next/link';
import { ArrowRight, Music, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <Globe className="mr-2 h-4 w-4" />
            Primeira plataforma Web3 em Angola
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Proteja suas{' '}
            <span className="text-blue-600">
              obras musicais
            </span>{' '}
            com blockchain
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Mp4Dao é a primeira plataforma descentralizada para registo de copyright musical em Angola. 
            Garanta a proteção legal das suas criações com tecnologia blockchain, IPFS e conformidade 
            com a Lei n.º 15/14.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="group" asChild>
              <Link href="/register">
                <Shield className="mr-2 h-5 w-5" />
                Registar Obra
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" asChild>
              <Link href="/works">
                <Music className="mr-2 h-5 w-5" />
                Explorar Obras
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Seguro & Imutável</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-gray-900">&lt;2min</div>
              <div className="text-sm text-gray-600">Registo Rápido</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Disponível Sempre</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary-400 to-secondary-400 opacity-20"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  );
}
