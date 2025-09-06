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
#!/bin/bash

# MP4 DAO - Deploy Script para Desenvolvimento
echo "🚀 Iniciando deploy do MP4 DAO para ambiente de desenvolvimento..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "wrangler.toml" ]; then
    print_error "wrangler.toml não encontrado. Execute este script na pasta raiz do projeto."
    exit 1
fi

# Configurar variáveis de ambiente para o build
export NEXT_PUBLIC_API_URL="https://mp4dao-backend-dev.workers.dev"
export NEXT_PUBLIC_CHAIN_ID="80002"
export NEXT_PUBLIC_RPC_URL="https://rpc-amoy.polygon.technology/"
export NEXT_PUBLIC_CONTRACT_ADDRESS="0x1234567890123456789012345678901234567890"
export NEXT_PUBLIC_APP_URL="https://mp4dao-dev.pages.dev"

print_status "Instalando dependências do frontend..."
cd frontend
npm install

print_status "Fazendo build do frontend Next.js..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build do frontend concluído com sucesso!"
else
    print_error "Falha no build do frontend"
    exit 1
fi

cd ..

print_status "Fazendo login no Cloudflare (se necessário)..."
wrangler login

print_status "Fazendo deploy do frontend para Cloudflare Pages..."
wrangler pages deploy frontend/out --project-name mp4dao-dev

if [ $? -eq 0 ]; then
    print_success "🎉 Deploy concluído com sucesso!"
    echo ""
    print_success "🌐 Frontend disponível em: https://mp4dao-dev.pages.dev"
    echo ""
else
    print_error "Falha no deploy"
    exit 1
fi

print_warning "Próximos passos:"
echo "1. Configure o domínio personalizado no Cloudflare Pages"
echo "2. Configure as variáveis de ambiente no dashboard do Cloudflare"
echo "3. Configure o backend API separadamente"
