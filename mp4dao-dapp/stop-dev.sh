#!/bin/bash

# MP4 DAO Development Environment Stop Script
echo "🛑 Parando ambiente de desenvolvimento MP4 DAO..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to kill process by PID file
kill_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null; then
            kill $pid
            print_success "✓ $service_name parado (PID: $pid)"
        else
            print_status "$service_name já estava parado"
        fi
        rm -f "$pid_file"
    else
        print_status "Arquivo PID não encontrado para $service_name"
    fi
}

# Kill all services
print_status "Parando serviços..."

# Stop Hardhat
kill_process "contracts/hardhat.pid" "Rede Hardhat"

# Stop Backend
kill_process "backend/backend.pid" "Backend NestJS"

# Stop Frontend
kill_process "frontend/frontend.pid" "Frontend Next.js"

# Kill any remaining Node processes that might be related
print_status "Limpando processos relacionados..."

# Kill processes on specific ports
for port in 3000 3001 8545; do
    pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        kill $pid 2>/dev/null
        print_success "✓ Processo na porta $port terminado"
    fi
done

# Clean up log files
print_status "Limpando arquivos de log..."
rm -f contracts/hardhat.log
rm -f backend/backend.log
rm -f frontend/frontend.log

print_success "🎵 Todos os serviços MP4 DAO foram parados!"
echo ""
print_status "Para reiniciar, execute: ./start-dev.sh"
