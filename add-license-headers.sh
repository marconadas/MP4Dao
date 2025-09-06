#!/bin/bash

# Script para adicionar cabeçalhos de licença em todos os arquivos do projeto MP4 DAO
# Autor: Marcos de Jesus Araújo Cândido dos Santos

LICENSE_HEADER_TS="/**
 * MP4 DAO - Plataforma de Registo de Copyright Musical em Angola
 * 
 * Copyright (c) 2024 Marcos de Jesus Araújo Cândido dos Santos
 * Rua Luís Simões 55A 2ºEsq, Pendão, Queluz, 2745-035, Lisboa
 * 
 * This file is part of the MP4 DAO project.
 * 
 * Licensed under the MIT License. See LICENSE file for details.
 */"

LICENSE_HEADER_JS="/**
 * MP4 DAO - Plataforma de Registo de Copyright Musical em Angola
 * 
 * Copyright (c) 2024 Marcos de Jesus Araújo Cândido dos Santos
 * Rua Luís Simões 55A 2ºEsq, Pendão, Queluz, 2745-035, Lisboa
 * 
 * This file is part of the MP4 DAO project.
 * 
 * Licensed under the MIT License. See LICENSE file for details.
 */"

LICENSE_HEADER_SOL="// SPDX-License-Identifier: MIT
// MP4 DAO - Plataforma de Registo de Copyright Musical em Angola
// 
// Copyright (c) 2024 Marcos de Jesus Araújo Cândido dos Santos
// Rua Luís Simões 55A 2ºEsq, Pendão, Queluz, 2745-035, Lisboa
// 
// This file is part of the MP4 DAO project.
// 
// Licensed under the MIT License. See LICENSE file for details."

echo "🔐 Adicionando cabeçalhos de licença ao projeto MP4 DAO..."

# Função para adicionar cabeçalho em arquivos TypeScript/JavaScript
add_license_to_file() {
    local file="$1"
    local header="$2"
    
    # Verificar se o arquivo já tem cabeçalho de licença
    if grep -q "Copyright (c) 2024 Marcos de Jesus" "$file"; then
        echo "  ⏭️  $file já tem cabeçalho de licença"
        return
    fi
    
    # Adicionar cabeçalho no início do arquivo
    echo "$header" > temp_file
    cat "$file" >> temp_file
    mv temp_file "$file"
    echo "  ✅ $file - cabeçalho adicionado"
}

# Processar arquivos do frontend
echo "📱 Processando arquivos do frontend..."
find mp4dao-dapp/frontend/src -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | while read file; do
    add_license_to_file "$file" "$LICENSE_HEADER_TS"
done

# Processar arquivos do backend
echo "🔧 Processando arquivos do backend..."
find mp4dao-dapp/backend/src -name "*.ts" -o -name "*.js" | while read file; do
    add_license_to_file "$file" "$LICENSE_HEADER_TS"
done

# Processar contratos Solidity
echo "⛓️  Processando contratos Solidity..."
find mp4dao-dapp/contracts -name "*.sol" | while read file; do
    add_license_to_file "$file" "$LICENSE_HEADER_SOL"
done

# Processar scripts
echo "📜 Processando scripts..."
find mp4dao-dapp -name "*.sh" | while read file; do
    add_license_to_file "$file" "$LICENSE_HEADER_JS"
done

echo "✅ Cabeçalhos de licença adicionados com sucesso!"
echo "📄 Verifique o arquivo LICENSE para detalhes completos da licença."
