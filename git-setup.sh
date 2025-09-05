#!/bin/bash

# Script de configuração Git para MP4Dao
# Este script ajuda a configurar o repositório remoto e as proteções de branch

echo "🚀 Configuração Git - MP4Dao"
echo "================================"

# Função para configurar repositório remoto
setup_remote() {
    echo "📡 Configurando repositório remoto..."
    echo "Escolha uma opção:"
    echo "1) GitHub"
    echo "2) GitLab"
    echo "3) Bitbucket"
    echo "4) Outro"
    
    read -p "Digite sua escolha (1-4): " choice
    
    case $choice in
        1)
            read -p "Digite a URL do repositório GitHub (ex: git@github.com:usuario/mp4dao.git): " repo_url
            ;;
        2)
            read -p "Digite a URL do repositório GitLab (ex: git@gitlab.com:usuario/mp4dao.git): " repo_url
            ;;
        3)
            read -p "Digite a URL do repositório Bitbucket: " repo_url
            ;;
        4)
            read -p "Digite a URL do repositório: " repo_url
            ;;
        *)
            echo "❌ Opção inválida"
            return 1
            ;;
    esac
    
    if [ ! -z "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✅ Repositório remoto configurado: $repo_url"
        
        # Push de todas as branches
        echo "📤 Enviando branches para o repositório remoto..."
        git push -u origin main
        git push -u origin develop
        git push -u origin frontend-dev
        git push -u origin backend-dev
        
        echo "✅ Repositório principal configurado!"
        echo ""
        echo "🔒 IMPORTANTE: Smart Contracts"
        echo "Os smart contracts estão em repositório separado: MP4Dao-Contracts-Private"
        echo "Este repositório deve ser mantido SEMPRE PRIVADO e com acesso restrito."
    fi
}

# Função para mostrar status das branches
show_branch_status() {
    echo ""
    echo "📊 Status das Branches:"
    echo "======================"
    git branch -v
    echo ""
    echo "🔄 Branches remotas:"
    git branch -r 2>/dev/null || echo "Nenhuma branch remota configurada"
}

# Função para criar branch de feature
create_feature_branch() {
    echo ""
    read -p "Digite o nome da nova feature (ex: user-authentication): " feature_name
    
    if [ ! -z "$feature_name" ]; then
        git checkout develop
        git checkout -b "feature/$feature_name"
        echo "✅ Branch feature/$feature_name criada a partir de develop"
        echo "💡 Para fazer merge: git checkout develop && git merge feature/$feature_name"
    fi
}

# Função para configurar repositório de contratos (APENAS PROPRIETÁRIO)
setup_contracts_repo() {
    echo ""
    echo "🔒 Configuração do Repositório de Smart Contracts"
    echo "================================================"
    echo "⚠️  ATENÇÃO: Esta configuração é APENAS para o proprietário!"
    echo ""
    
    if [ ! -d "../MP4Dao-Contracts-Private" ]; then
        echo "❌ Repositório de contratos não encontrado em ../MP4Dao-Contracts-Private"
        echo "   Certifique-se de que o repositório existe."
        return 1
    fi
    
    echo "📁 Repositório de contratos encontrado!"
    echo ""
    read -p "Digite a URL do repositório PRIVADO para os contratos: " contracts_repo_url
    
    if [ ! -z "$contracts_repo_url" ]; then
        cd ../MP4Dao-Contracts-Private
        git remote add origin "$contracts_repo_url" 2>/dev/null || git remote set-url origin "$contracts_repo_url"
        
        echo "📤 Enviando contratos para repositório privado..."
        git push -u origin main
        
        echo "✅ Repositório de contratos configurado!"
        echo "🔒 MANTENHA ESTE REPOSITÓRIO SEMPRE PRIVADO!"
        
        cd ../MP4Dao
    else
        echo "❌ URL não fornecida."
    fi
}

# Função para mostrar comandos úteis
show_useful_commands() {
    echo ""
    echo "🛠️  Comandos Úteis:"
    echo "=================="
    echo "# Listar todas as branches:"
    echo "git branch -a"
    echo ""
    echo "# Mudar para branch de desenvolvimento:"
    echo "git checkout develop"
    echo ""
    echo "# Criar nova feature:"
    echo "git checkout develop"
    echo "git checkout -b feature/nome-da-feature"
    echo ""
    echo "# Merge de feature para develop:"
    echo "git checkout develop"
    echo "git merge feature/nome-da-feature"
    echo ""
    echo "# ⚠️  APENAS PROPRIETÁRIO - Repositório de contratos:"
    echo "cd ../MP4Dao-Contracts-Private"
    echo ""
    echo "# Sincronizar com remoto:"
    echo "git pull origin main"
    echo "git push origin branch-name"
}

# Menu principal
while true; do
    echo ""
    echo "Escolha uma opção:"
    echo "1) Configurar repositório remoto (dApp público)"
    echo "2) Configurar repositório de contratos (PRIVADO - só proprietário)"
    echo "3) Ver status das branches"
    echo "4) Criar nova feature branch"
    echo "5) Mostrar comandos úteis"
    echo "6) Sair"
    echo ""
    read -p "Digite sua escolha (1-6): " option
    
    case $option in
        1) setup_remote ;;
        2) setup_contracts_repo ;;
        3) show_branch_status ;;
        4) create_feature_branch ;;
        5) show_useful_commands ;;
        6) 
            echo "👋 Até logo!"
            exit 0
            ;;
        *) echo "❌ Opção inválida" ;;
    esac
done
