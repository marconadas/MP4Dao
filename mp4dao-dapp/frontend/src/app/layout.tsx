import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mp4Dao - Registo de Copyright Musical Angola',
  description: 'Primeira plataforma Web3 para registo de copyright musical em Angola. Proteja suas obras com blockchain, IPFS e conformidade legal.',
  keywords: [
    'copyright',
    'música',
    'Angola',
    'blockchain',
    'Web3',
    'IPFS',
    'direitos autorais',
    'registo',
    'obras musicais',
    'UNAC-SA',
    'SADIA'
  ],
  authors: [{ name: 'Mp4Dao Team' }],
  creator: 'Mp4Dao',
  publisher: 'Mp4Dao',
  openGraph: {
    type: 'website',
    locale: 'pt_AO',
    url: 'https://mp4dao.ao',
    title: 'Mp4Dao - Revolução do Copyright Musical em Angola',
    description: 'Proteja suas obras musicais com tecnologia blockchain. Primeira plataforma Web3 para registo de copyright em Angola.',
    siteName: 'Mp4Dao',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mp4Dao - Copyright Musical Angola',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mp4Dao - Copyright Musical Angola',
    description: 'Primeira plataforma Web3 para registo de copyright musical em Angola',
    images: ['/images/og-image.png'],
    creator: '@mp4dao',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://mp4dao.ao',
    languages: {
      'pt-AO': 'https://mp4dao.ao',
      'en': 'https://mp4dao.ao/en',
    },
  },
  other: {
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#2563eb',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
