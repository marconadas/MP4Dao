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
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Music, Shield, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectWallet } from '@/components/auth/connect-wallet';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Início', href: '/', icon: Music },
  { name: 'Registar Obra', href: '/register', icon: Shield },
  { name: 'Minhas Obras', href: '/works', icon: FileText },
  { name: 'Disputas', href: '/disputes', icon: Users },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm dark:shadow-border/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Mp4Dao</span>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Music className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-primary">Mp4Dao</h1>
                <p className="text-xs text-muted-foreground">Copyright Musical Angola</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
          >
            <span className="sr-only">Abrir menu principal</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 text-sm font-semibold leading-6 transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side actions */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:space-x-4">
          <ThemeToggle />
          <ConnectWallet />
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                <span className="sr-only">Mp4Dao</span>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Music className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gradient">Mp4Dao</h1>
                    <p className="text-xs text-muted-foreground">Copyright Musical</p>
                  </div>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5"
              >
                <span className="sr-only">Fechar menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center space-x-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 transition-colors hover:bg-accent',
                          pathname === item.href
                            ? 'text-primary bg-accent'
                            : 'text-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="py-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tema</span>
                    <ThemeToggle />
                  </div>
                  <ConnectWallet />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
