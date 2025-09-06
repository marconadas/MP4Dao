# MP4 DAO - Plataforma de Registo de Copyright Musical em Angola

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)

## 📋 Sobre o Projeto

O **MP4 DAO** é uma plataforma Web3 revolucionária para o registo de copyright musical em Angola, construída com tecnologias blockchain de última geração. A plataforma permite que músicos, compositores e produtores registrem suas obras de forma descentralizada, segura e imutável.

## 👨‍💻 Autor

**Marcos de Jesus Araújo Cândido dos Santos**
- 📧 Email: marcos.santos@mp4dao.com
- 🏠 Endereço: Rua Luís Simões 55A 2ºEsq, Pendão, Queluz, 2745-035, Lisboa
- 🌐 Website: https://mp4dao.com
- 💼 LinkedIn: [Marcos Santos](https://linkedin.com/in/marcossantos)

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React para produção
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis
- **Wagmi** - Hooks para Ethereum
- **Web3Modal** - Conectores de carteira

### Backend
- **NestJS** - Framework Node.js escalável
- **TypeORM** - ORM para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e filas
- **JWT** - Autenticação
- **Swagger** - Documentação da API

### Blockchain
- **Solidity** - Linguagem de contratos inteligentes
- **Hardhat** - Framework de desenvolvimento
- **OpenZeppelin** - Bibliotecas de contratos seguros
- **Polygon** - Rede blockchain escalável

### Deploy
- **Cloudflare Pages** - Hospedagem do frontend
- **Wrangler** - CLI para Cloudflare
- **Docker** - Containerização

## 🏗️ Arquitetura

```
mp4dao-dapp/
├── frontend/          # Aplicação Next.js
├── backend/           # API NestJS
├── contracts/         # Smart contracts Solidity
├── mobile/           # App React Native (futuro)
└── shared/           # Código compartilhado
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL
- Redis

### Instalação
```bash
# Clonar o repositório
git clone https://github.com/marcossantos/mp4dao.git
cd mp4dao

# Instalar dependências
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../contracts && npm install
cd ..
```

### Execução em Desenvolvimento
```bash
# Iniciar todos os serviços
./start-dev.sh

# Ou individualmente
npm run dev:frontend  # Frontend em http://localhost:3000
npm run dev:backend   # Backend em http://localhost:3001
npm run dev:contracts # Hardhat em http://localhost:8545
```

### Deploy em Produção
```bash
# Deploy do frontend para Cloudflare Pages
./deploy-dev.sh

# Deploy dos contratos
cd contracts && npm run deploy
```

## 📱 Funcionalidades

### Para Músicos
- ✅ Registo de obras musicais
- ✅ Upload de ficheiros de evidência
- ✅ Gestão de direitos autorais
- ✅ Sistema de royalties
- ✅ Marketplace de NFTs

### Para Plataforma
- ✅ Verificação de autenticidade
- ✅ Sistema de disputas
- ✅ Mediação descentralizada
- ✅ Analytics e relatórios
- ✅ API REST completa

## 🔐 Segurança

- **Smart Contracts Auditados** - Contratos verificados e seguros
- **Criptografia End-to-End** - Dados protegidos
- **Autenticação Web3** - Login sem senhas
- **Imutabilidade Blockchain** - Registos permanentes
- **Sistema de Disputas** - Resolução de conflitos

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

```
Copyright (c) 2024 Marcos de Jesus Araújo Cândido dos Santos
Rua Luís Simões 55A 2ºEsq, Pendão, Queluz, 2745-035, Lisboa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de submeter pull requests.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: marcos.santos@mp4dao.com
- 🐛 Issues: [GitHub Issues](https://github.com/marcossantos/mp4dao/issues)
- 📖 Documentação: [Wiki](https://github.com/marcossantos/mp4dao/wiki)

## 🌟 Agradecimentos

- Comunidade OpenZeppelin pelos contratos seguros
- Equipe do Next.js pela excelente framework
- Comunidade NestJS pela robusta API framework
- Cloudflare pela infraestrutura de deploy

---

**Desenvolvido com ❤️ por Marcos de Jesus Araújo Cândido dos Santos**

*Transformando a indústria musical angolana através da tecnologia blockchain* 🎵
