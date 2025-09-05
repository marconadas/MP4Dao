# Estratégia de Branches - MP4Dao

## Estrutura de Branches

### 1. Branch Principal (main)
- **Propósito**: Código de produção estável
- **Proteção**: Requer aprovação para merge
- **Acesso**: Público (exceto smart contracts)

### 2. Branch de Desenvolvimento (develop)
- **Propósito**: Integração contínua de novas funcionalidades
- **Base para**: Todas as branches de feature
- **Merge para**: main (via pull request)

### 3. Smart Contracts (Repositório Separado)
- **Localização**: Repositório privado separado `MP4Dao-Contracts-Private`
- **Acesso**: RESTRITO - Apenas o proprietário
- **Motivo**: Máxima segurança para contratos críticos
- **Conteúdo**: 
  - Contratos Solidity
  - Scripts de deploy
  - Testes de contratos
  - Configurações de rede
- **Integração**: Via endereços de contratos deployados

### 4. Branches de Desenvolvimento por Componente

#### frontend-dev
- **Propósito**: Desenvolvimento da interface do usuário
- **Base**: develop
- **Merge para**: develop

#### backend-dev
- **Propósito**: Desenvolvimento da API e serviços
- **Base**: develop
- **Merge para**: develop

## Fluxo de Trabalho

### Para Smart Contracts (REPOSITÓRIO SEPARADO)
1. Trabalhar no repositório separado `MP4Dao-Contracts-Private`
2. Fazer commits frequentes com mensagens descritivas
3. Testes obrigatórios antes de qualquer deploy
4. Deploy apenas em ambientes controlados
5. Atualizar `contracts-config.json` com novos endereços

### Para Frontend/Backend
1. Criar feature branch a partir de `develop`
2. Desenvolver funcionalidade
3. Merge request para `develop`
4. Após aprovação, merge para `develop`
5. Periodicamente, merge de `develop` para `main`

## Regras de Proteção

### Branch main
- Não permite push direto
- Requer pull request
- Requer revisão de código
- Testes automatizados devem passar

### Repositório MP4Dao-Contracts-Private
- **REPOSITÓRIO SEPARADO E PRIVADO**
- **ACESSO EXCLUSIVO DO PROPRIETÁRIO**
- Não permite colaboradores externos
- Histórico completo protegido
- Backups regulares obrigatórios

### Branch develop
- Permite push direto para desenvolvimento rápido
- Requer testes antes de merge para main

## Comandos Úteis

```bash
# Listar todas as branches
git branch -a

# Acessar repositório de contratos (APENAS PROPRIETÁRIO)
cd ../MP4Dao-Contracts-Private

# Criar nova feature branch
git checkout develop
git checkout -b feature/nova-funcionalidade

# Merge de feature para develop
git checkout develop
git merge feature/nova-funcionalidade

# Merge de develop para main (via PR recomendado)
git checkout main
git merge develop
```

## Segurança dos Smart Contracts

⚠️ **ATENÇÃO**: O repositório `MP4Dao-Contracts-Private` contém código crítico que controla ativos digitais e tokens. Manter sigilo absoluto é essencial para:

- Prevenir exploração de vulnerabilidades
- Proteger estratégias de deploy
- Manter vantagem competitiva
- Evitar ataques de front-running
- Proteger chaves e configurações sensíveis

## Backup e Recuperação

- Backup diário do repositório `MP4Dao-Contracts-Private`
- Múltiplas cópias em locais seguros
- Documentação de todas as alterações críticas
- Plano de recuperação em caso de comprometimento
