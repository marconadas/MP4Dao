# 🎵 MP4 DAO - Plataforma de Registo de Copyright Musical para Angola

> **🔒 Nota de Segurança**: Os smart contracts deste projeto são mantidos em repositório privado separado por questões de segurança. Este repositório contém apenas o dApp (frontend + backend).

MP4 DAO é uma plataforma descentralizada para registo e proteção de direitos autorais musicais em Angola, utilizando tecnologia blockchain para garantir a imutabilidade e transparência dos registos.

## 🌟 Funcionalidades

### ✅ Implementadas
- 🔗 **Conectividade Web3**: Integração com MetaMask e outras carteiras
- 📝 **Registo de Obras**: Interface completa para registo de obras musicais
- 👥 **Gestão de Coautoria**: Sistema de splits percentuais entre autores
- 🔍 **Visualização de Obras**: Listagem e pesquisa de obras registadas
- ⛓️ **Smart Contracts**: Contratos inteligentes seguros e auditados
- 🏗️ **Backend API**: API RESTful completa com NestJS
- 💾 **Armazenamento**: Integração com IPFS para ficheiros
- 🎨 **Interface Moderna**: UI/UX responsivo com Tailwind CSS

### 🚧 Em Desenvolvimento
- ⚖️ **Sistema de Disputas**: Mediação e resolução de conflitos
- 📊 **Analytics**: Dashboard com estatísticas detalhadas
- 🔔 **Notificações**: Sistema de alertas em tempo real
- 📱 **App Mobile**: Aplicação móvel React Native

## 🏗️ Arquitetura

```
MP4 DAO
├── 🎨 Frontend (Next.js + TypeScript)
│   ├── Interface do utilizador
│   ├── Integração Web3 (Wagmi)
│   └── Componentes UI (Tailwind CSS)
├── 🔧 Backend (NestJS + TypeScript)
│   ├── API RESTful
│   ├── Autenticação JWT
│   ├── Integração Blockchain
│   └── Gestão de Ficheiros
├── 🔒 Smart Contracts (Repositório Privado)
│   ├── MP4Token.sol
│   ├── MusicNFT.sol
│   ├── WorkRegistry.sol
│   ├── MP4TimelockController.sol
│   ├── Testes automatizados
│   └── Scripts de deploy
└── 📱 Mobile (React Native)
    └── [Em desenvolvimento]
```

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Git
- MetaMask (para testes)

### Instalação Automática

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd mp4dao-dapp
```

2. **Instale dependências**:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
# Contratos estão em repositório privado separado
cd ..
```

3. **Inicie o ambiente de desenvolvimento**:
```bash
./start-dev.sh
```

Este script irá:
- ✅ Iniciar rede Hardhat local
- ✅ Fazer deploy dos smart contracts
- ✅ Iniciar backend NestJS
- ✅ Iniciar frontend Next.js

### Acesso à Aplicação

Após executar o script de inicialização:

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:3001
- ⛓️ **Blockchain**: http://localhost:8545
- 📚 **Documentação API**: http://localhost:3001/api

### Configuração da MetaMask

1. Adicione a rede local Hardhat:
   - **Nome**: Hardhat Local
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Símbolo**: ETH

2. Importe uma conta de teste:
   - Chave privada: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Esta conta tem 10,000 ETH para testes

## 📖 Como Usar

### 1. Conectar Carteira
- Clique em "Conectar Carteira" no header
- Selecione MetaMask
- Autorize a conexão

### 2. Registar uma Obra
- Vá para "Registar Obra"
- Preencha os dados da obra:
  - Título, descrição, género
  - Tipo de obra (música, letra, instrumental, etc.)
  - Data de criação
  - Códigos ISWC/ISRC (opcionais)
- Adicione autores e percentagens (total deve ser 100%)
- Carregue ficheiros de evidência
- Configure visibilidade (pública/privada)
- Confirme transação (taxa: 0.001 ETH)

### 3. Visualizar Obras
- Acesse "Minhas Obras" para ver suas criações
- Use filtros para pesquisar
- Visualize detalhes e status de cada obra

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
mp4dao-dapp/
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and configs
│   │   └── styles/       # CSS styles
│   └── package.json
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── works/        # Works management
│   │   ├── blockchain/   # Blockchain integration
│   │   └── storage/      # File storage
│   └── package.json
├── contracts-config.json # Configuração dos contratos deployados
└── mobile/              # React Native app
    └── [Em desenvolvimento]
```

### Comandos Úteis

```bash
# Iniciar ambiente completo
./start-dev.sh

# Parar todos os serviços
./stop-dev.sh

# Contratos estão em repositório privado separado
# Consulte CONTRACTS_README.md para mais informações

# Executar apenas o frontend
cd frontend && npm run dev

# Executar apenas o backend
cd backend && npm run dev

# Para desenvolvimento local, use os endereços em contracts-config.json
```

### Variáveis de Ambiente

Crie arquivos `.env` em cada diretório conforme necessário:

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

**Backend** (`.env`):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/mp4dao
JWT_SECRET=your-jwt-secret
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://localhost:8545
IPFS_URL=http://localhost:5001
```

## 🧪 Testes

### Smart Contracts
```bash
cd contracts
npm test
```

### Backend
```bash
cd backend
npm run test
```

### Frontend
```bash
cd frontend
npm run test
```

## 📊 Smart Contract

### WorkRegistry.sol

O contrato principal `WorkRegistry` implementa:

- **Registo de Obras**: Função `registerWork()` com validações completas
- **Gestão de Autores**: Suporte a múltiplos autores com splits percentuais
- **Sistema de Disputas**: Criação e resolução de disputas
- **Metadados**: Armazenamento de URIs IPFS
- **Taxas Configuráveis**: Taxas de registo e disputa ajustáveis
- **Controles de Acesso**: Funções administrativas protegidas

### Endereços dos Contratos

- **Hardhat Local**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Polygon Mumbai**: [A ser deployado]
- **Polygon Mainnet**: [A ser deployado]

## 🛡️ Segurança

- ✅ Contratos auditados e testados
- ✅ Validações de entrada robustas
- ✅ Proteção contra reentrância
- ✅ Controles de acesso adequados
- ✅ Pausabilidade de emergência
- ✅ Verificação de integridade de dados

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: suporte@mp4dao.ao
- **Website**: https://mp4dao.ao
- **Documentação**: https://docs.mp4dao.ao

## 🇦🇴 Sobre Angola

Este projeto foi desenvolvido especificamente para o mercado angolano, respeitando:

- 📜 **Lei n.º 15/14** (Lei dos Direitos de Autor)
- 🏛️ **IGESIC** (Instituto de Gestão da Sociedade da Informação)
- 🎵 **SOMAS** (Sociedade Angolana de Música)
- 💰 **Kwanza Digital** (preparado para moeda digital nacional)

---

**Desenvolvido com ❤️ para a música angolana** 🇦🇴