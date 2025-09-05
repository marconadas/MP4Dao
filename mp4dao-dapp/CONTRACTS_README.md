# Smart Contracts - MP4Dao

## 🔒 Localização dos Contratos

Os smart contracts do MP4Dao são mantidos em um **repositório privado separado** por questões de segurança.

### Por que os contratos não estão aqui?

- **Segurança**: Contratos contêm lógica crítica que pode ser explorada se exposta
- **Proteção de Ativos**: Contratos controlam tokens e NFTs valiosos
- **Vantagem Competitiva**: Estratégias de implementação devem permanecer confidenciais
- **Prevenção de Ataques**: Evita análise prévia por atacantes

## 📋 Contratos Disponíveis

O projeto inclui os seguintes smart contracts:

1. **MP4Token** - Token ERC-20 principal do ecossistema
2. **MusicNFT** - NFTs para representar obras musicais
3. **WorkRegistry** - Registro descentralizado de obras e direitos autorais
4. **MP4TimelockController** - Controle de governança com timelock

## 🔗 Integração

### Para Desenvolvedores

Os contratos já estão deployados e suas ABIs/endereços estão disponíveis em `contracts-config.json`.

```javascript
// Exemplo de uso no frontend
import contractsConfig from './contracts-config.json';

const MP4TokenAddress = contractsConfig.deployedContracts.development.MP4Token;
```

### Para Colaboradores

Se você está contribuindo para o projeto e precisa interagir com os contratos:

1. Use os endereços fornecidos em `contracts-config.json`
2. As ABIs serão fornecidas após o deploy
3. Para desenvolvimento, use a rede local configurada

## 🚀 Deploy e Testes

Os contratos são deployados e testados em ambiente controlado. Os endereços e ABIs são atualizados automaticamente após cada deploy.

## 📞 Contato

Se você é um colaborador autorizado e precisa de acesso aos contratos, entre em contato com o proprietário do projeto.

---

**Nota**: Esta estrutura garante que o código público do dApp seja totalmente funcional enquanto mantém a segurança dos smart contracts.
