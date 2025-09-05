import Link from 'next/link';
import { Music, Github, Twitter, Mail } from 'lucide-react';

const navigation = {
  product: [
    { name: 'Registar Obra', href: '/register' },
    { name: 'Minhas Obras', href: '/works' },
    { name: 'Disputas', href: '/disputes' },
    { name: 'Verificador', href: '/verify' },
  ],
  company: [
    { name: 'Sobre', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Carreiras', href: '/careers' },
    { name: 'Parceiros', href: '/partners' },
  ],
  legal: [
    { name: 'Privacidade', href: '/privacy' },
    { name: 'Termos', href: '/terms' },
    { name: 'Lei 15/14', href: '/legal' },
    { name: 'Suporte', href: '/support' },
  ],
  social: [
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
    {
      name: 'GitHub',
      href: '#',
      icon: Github,
    },
    {
      name: 'Email',
      href: 'mailto:suporte@mp4dao.ao',
      icon: Mail,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-background border-t" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Music className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Mp4Dao</h1>
                <p className="text-xs text-muted-foreground">Copyright Musical Angola</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Primeira plataforma Web3 para registo de copyright musical em Angola. 
              Protegendo os direitos dos artistas com tecnologia blockchain.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a key={item.name} href={item.href} className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">Produto</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">Empresa</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <p className="text-xs leading-5 text-muted-foreground">
              &copy; 2024 Mp4Dao. Todos os direitos reservados. Feito com ❤️ em Angola.
            </p>
            <div className="mt-4 flex items-center space-x-4 text-xs text-muted-foreground sm:mt-0">
              <span>Conformidade: Lei n.º 15/14</span>
              <span>•</span>
              <span>Blockchain: Polygon</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
