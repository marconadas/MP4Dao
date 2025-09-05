#!/bin/bash

# MP4 DAO Development Environment Setup
echo "🎵 Iniciando ambiente de desenvolvimento MP4 DAO..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Este script deve ser executado na pasta raiz do projeto MP4 DAO"
    exit 1
fi

# Start Hardhat network in background
print_status "Iniciando rede Hardhat local..."
cd contracts
npx hardhat node > hardhat.log 2>&1 &
HARDHAT_PID=$!
echo $HARDHAT_PID > hardhat.pid
cd ..

# Wait for Hardhat to start
print_status "Aguardando rede Hardhat inicializar..."
sleep 5

# Deploy contracts
print_status "Fazendo deploy dos smart contracts..."
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
if [ $? -eq 0 ]; then
    print_success "Smart contracts deployados com sucesso!"
else
    print_error "Falha no deploy dos smart contracts"
    exit 1
fi
cd ..

# Start backend
print_status "Iniciando backend NestJS..."
cd backend
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
cd ..

# Start frontend
print_status "Iniciando frontend Next.js..."
cd frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid
cd ..

# Wait for services to start
print_status "Aguardando serviços inicializarem..."
sleep 10

# Check if services are running
print_status "Verificando status dos serviços..."

# Check Hardhat
if ps -p $HARDHAT_PID > /dev/null; then
    print_success "✓ Rede Hardhat: http://localhost:8545"
else
    print_error "✗ Rede Hardhat falhou ao iniciar"
fi

# Check Backend
if ps -p $BACKEND_PID > /dev/null; then
    print_success "✓ Backend API: http://localhost:3001"
else
    print_error "✗ Backend falhou ao iniciar"
fi

# Check Frontend
if ps -p $FRONTEND_PID > /dev/null; then
    print_success "✓ Frontend: http://localhost:3000"
else
    print_error "✗ Frontend falhou ao iniciar"
fi

echo ""
print_success "🚀 MP4 DAO está rodando!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "⛓️  Blockchain: http://localhost:8545"
echo "📚 API Docs: http://localhost:3001/api"
echo ""
echo "Para parar todos os serviços, execute: ./stop-dev.sh"
echo ""
print_warning "Logs dos serviços:"
echo "  - Hardhat: contracts/hardhat.log"
echo "  - Backend: backend/backend.log" 
echo "  - Frontend: frontend/frontend.log"
echo ""
print_status "Pressione Ctrl+C para parar o monitoramento (serviços continuarão rodando)"

# Monitor services
while true; do
    sleep 30
    
    # Check if any service died
    if ! ps -p $HARDHAT_PID > /dev/null; then
        print_error "Rede Hardhat parou inesperadamente"
        break
    fi
    
    if ! ps -p $BACKEND_PID > /dev/null; then
        print_error "Backend parou inesperadamente"
        break
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null; then
        print_error "Frontend parou inesperadamente"
        break
    fi
done
