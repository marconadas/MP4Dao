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
        
        # Atenção especial para a branch de contratos
        echo "⚠️  ATENÇÃO: A branch 'contracts-private' contém smart contracts sensíveis!"
        echo "   Considere usar um repositório privado separado para esta branch."
        read -p "Deseja fazer push da branch contracts-private? (y/N): " push_contracts
        
        if [[ $push_contracts =~ ^[Yy]$ ]]; then
            git push -u origin contracts-private
            echo "🔒 Branch contracts-private enviada. MANTENHA O REPOSITÓRIO PRIVADO!"
        else
            echo "🛡️  Branch contracts-private mantida apenas localmente por segurança."
        fi
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
    echo "# ⚠️  APENAS PROPRIETÁRIO - Branch de contratos:"
    echo "git checkout contracts-private"
    echo ""
    echo "# Sincronizar com remoto:"
    echo "git pull origin main"
    echo "git push origin branch-name"
}

# Menu principal
while true; do
    echo ""
    echo "Escolha uma opção:"
    echo "1) Configurar repositório remoto"
    echo "2) Ver status das branches"
    echo "3) Criar nova feature branch"
    echo "4) Mostrar comandos úteis"
    echo "5) Sair"
    echo ""
    read -p "Digite sua escolha (1-5): " option
    
    case $option in
        1) setup_remote ;;
        2) show_branch_status ;;
        3) create_feature_branch ;;
        4) show_useful_commands ;;
        5) 
            echo "👋 Até logo!"
            exit 0
            ;;
        *) echo "❌ Opção inválida" ;;
    esac
done
