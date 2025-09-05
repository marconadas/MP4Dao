// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

/**
 * @title MP4Token
 * @notice Token de governança e utilidade da plataforma MP4DAO
 * @dev Token ERC-20 com funcionalidades de:
 * - Governança descentralizada
 * - Pagamento de taxas com desconto
 * - Sistema de recompensas
 * - Staking para mediação
 */
contract MP4Token is ERC20, ERC20Burnable, ERC20Pausable, ERC20Votes, ERC20Permit, Ownable, ReentrancyGuard {
    
    // =============================================================
    //                        CONSTANTES
    // =============================================================
    
    /// @dev Supply máximo de tokens (100 milhões)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    /// @dev Percentagem mínima para proposta de governança (1%)
    uint256 public constant PROPOSAL_THRESHOLD = MAX_SUPPLY / 100;
    
    /// @dev Percentagem mínima para quorum (5%)
    uint256 public constant QUORUM_THRESHOLD = MAX_SUPPLY * 5 / 100;
    
    // =============================================================
    //                        ESTRUTURAS
    // =============================================================
    
    /**
     * @dev Estrutura de uma proposta de governança
     */
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        uint256 snapshotBlock;          // NOVO: Block de snapshot para votos
        bool executed;
        bool cancelled;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice; // true = for, false = against
    }
    
    /**
     * @dev Estrutura de staking para mediação
     */
    struct MediatorStake {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewardsEarned;
        uint256 unlockTime;      // NOVO: Timestamp de unlock
        uint256 pendingUnstake;  // NOVO: Quantidade pendente de unstake
        bool active;
        bool slashed;            // NOVO: Flag para slashing
    }
    
    // =============================================================
    //                     VARIÁVEIS DE ESTADO
    // =============================================================
    
    /// @dev Mapeamento de propostas
    mapping(uint256 => Proposal) public proposals;
    
    /// @dev Contador de propostas
    uint256 public proposalCount;
    
    /// @dev Duração de votação (7 dias)
    uint256 public votingDuration = 7 days;
    
    /// @dev Mapeamento de stakes de mediadores
    mapping(address => MediatorStake) public mediatorStakes;
    
    /// @dev Stake mínimo para ser mediador (10,000 MP4)
    uint256 public minimumMediatorStake = 10_000 * 10**18;
    
    /// @dev Pool de recompensas para mediadores
    uint256 public mediatorRewardPool;
    
    /// @dev Taxa de desconto para pagamentos em MP4 (20%)
    uint256 public paymentDiscount = 2000; // 20% em basis points
    
    /// @dev Endereços autorizados para mint (contratos da plataforma)
    mapping(address => bool) public authorizedMinters;
    
    /// @dev Total de tokens em staking
    uint256 public totalStaked;
    
    /// @dev Constantes para lock periods
    uint256 public constant MEDIATOR_LOCK_PERIOD = 30 days;
    uint256 public constant UNSTAKE_DELAY = 7 days;
    
    /// @dev Mapeamento para pedidos de unstake
    mapping(address => uint256) public unstakeRequests;
    
    // =============================================================
    //                         EVENTOS
    // =============================================================
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    
    event ProposalCancelled(uint256 indexed proposalId);
    
    event MediatorStaked(
        address indexed mediator,
        uint256 amount
    );
    
    event MediatorUnstaked(
        address indexed mediator,
        uint256 amount
    );
    
    event RewardsDistributed(
        address indexed mediator,
        uint256 amount
    );
    
    event PaymentMade(
        address indexed payer,
        uint256 tokenAmount,
        uint256 discountApplied
    );
    
    event UnstakeRequested(
        address indexed mediator,
        uint256 amount,
        uint256 executeAt
    );
    
    event MediatorSlashed(
        address indexed mediator,
        uint256 amount,
        string reason
    );
    
    // =============================================================
    //                       MODIFICADORES
    // =============================================================
    
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "MP4Token: not authorized minter");
        _;
    }
    
    modifier validProposal(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "MP4Token: invalid proposal");
        _;
    }
    
    // =============================================================
    //                       CONSTRUTOR
    // =============================================================
    
    constructor(
        address initialOwner,
        uint256 initialSupply
    ) ERC20("MP4DAO Token", "MP4") ERC20Permit("MP4DAO Token") Ownable(initialOwner) {
        require(initialSupply <= MAX_SUPPLY, "MP4Token: exceeds max supply");
        
        // Mint inicial para o owner (para distribuição)
        if (initialSupply > 0) {
            _mint(initialOwner, initialSupply);
        }
        
        // Autorizar o owner como minter inicial
        authorizedMinters[initialOwner] = true;
    }
    
    // =============================================================
    //                   FUNÇÕES DE GOVERNANÇA
    // =============================================================
    
    /**
     * @notice Criar proposta de governança
     * @param description Descrição da proposta
     * @return proposalId ID da proposta criada
     */
    function createProposal(
        string calldata description
    ) external returns (uint256 proposalId) {
        // CORREÇÃO: Usar voting power do bloco anterior para evitar manipulação
        uint256 proposerVotes = getPastVotes(msg.sender, block.number - 1);
        require(proposerVotes >= PROPOSAL_THRESHOLD, "MP4Token: insufficient voting power");
        require(bytes(description).length > 0, "MP4Token: empty description");
        
        proposalId = ++proposalCount;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.description = description;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + votingDuration;
        newProposal.snapshotBlock = block.number; // NOVO: Snapshot do bloco atual
        
        emit ProposalCreated(proposalId, msg.sender, description);
    }
    
    /**
     * @notice Votar numa proposta
     * @param proposalId ID da proposta
     * @param support True para votar a favor, false contra
     */
    function vote(
        uint256 proposalId,
        bool support
    ) external validProposal(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.startTime, "MP4Token: voting not started");
        require(block.timestamp <= proposal.endTime, "MP4Token: voting ended");
        require(!proposal.hasVoted[msg.sender], "MP4Token: already voted");
        require(!proposal.executed && !proposal.cancelled, "MP4Token: proposal not active");
        
        // CORREÇÃO: Usar voting power do snapshot para evitar manipulação
        uint256 voterBalance = getPastVotes(msg.sender, proposal.snapshotBlock);
        require(voterBalance > 0, "MP4Token: no voting power at snapshot");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voteChoice[msg.sender] = support;
        
        if (support) {
            proposal.forVotes += voterBalance;
        } else {
            proposal.againstVotes += voterBalance;
        }
        
        emit VoteCast(proposalId, msg.sender, support, voterBalance);
    }
    
    /**
     * @notice Executar proposta aprovada
     * @param proposalId ID da proposta
     */
    function executeProposal(uint256 proposalId) external validProposal(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.endTime, "MP4Token: voting still active");
        require(!proposal.executed && !proposal.cancelled, "MP4Token: proposal not executable");
        require(proposal.forVotes > proposal.againstVotes, "MP4Token: proposal rejected");
        require(proposal.forVotes >= QUORUM_THRESHOLD, "MP4Token: quorum not reached");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
    }
    
    // =============================================================
    //                   FUNÇÕES DE STAKING
    // =============================================================
    
    /**
     * @notice Fazer stake para se tornar mediador
     * @param amount Quantidade de tokens para stake
     */
    function stakeMediator(uint256 amount) external nonReentrant {
        require(amount >= minimumMediatorStake, "MP4Token: insufficient stake amount");
        require(balanceOf(msg.sender) >= amount, "MP4Token: insufficient balance");
        
        MediatorStake storage stake = mediatorStakes[msg.sender];
        
        // Transferir tokens para o contrato
        _transfer(msg.sender, address(this), amount);
        
        stake.amount += amount;
        stake.stakedAt = block.timestamp;
        stake.unlockTime = block.timestamp + MEDIATOR_LOCK_PERIOD; // NOVO: Lock period
        stake.active = true;
        
        totalStaked += amount;
        
        emit MediatorStaked(msg.sender, amount);
    }
    
    /**
     * @notice Solicitar unstake de mediador (inicia período de delay)
     * @param amount Quantidade de tokens para retirar
     */
    function requestUnstake(uint256 amount) external nonReentrant {
        MediatorStake storage stake = mediatorStakes[msg.sender];
        
        require(stake.amount >= amount, "MP4Token: insufficient staked amount");
        require(block.timestamp >= stake.unlockTime, "MP4Token: still locked");
        require(!stake.slashed, "MP4Token: stake was slashed");
        
        stake.pendingUnstake += amount;
        stake.amount -= amount;
        unstakeRequests[msg.sender] = block.timestamp + UNSTAKE_DELAY;
        
        if (stake.amount < minimumMediatorStake) {
            stake.active = false;
        }
        
        totalStaked -= amount;
        
        emit UnstakeRequested(msg.sender, amount, block.timestamp + UNSTAKE_DELAY);
    }
    
    /**
     * @notice Executar unstake após período de delay
     */
    function executeUnstake() external nonReentrant {
        MediatorStake storage stake = mediatorStakes[msg.sender];
        
        require(unstakeRequests[msg.sender] > 0, "MP4Token: no unstake request");
        require(block.timestamp >= unstakeRequests[msg.sender], "MP4Token: unstake delay not met");
        require(stake.pendingUnstake > 0, "MP4Token: no pending unstake");
        
        uint256 unstakeAmount = stake.pendingUnstake;
        stake.pendingUnstake = 0;
        unstakeRequests[msg.sender] = 0;
        
        // Transferir tokens de volta
        _transfer(address(this), msg.sender, unstakeAmount);
        
        emit MediatorUnstaked(msg.sender, unstakeAmount);
    }
    
    /**
     * @notice Função para slashing por má conduta (apenas contratos autorizados)
     * @param mediator Endereço do mediador
     * @param slashAmount Quantidade a ser slashed
     * @param reason Razão do slashing
     */
    function slashMediator(
        address mediator,
        uint256 slashAmount,
        string calldata reason
    ) external onlyAuthorizedMinter {
        MediatorStake storage stake = mediatorStakes[mediator];
        
        require(stake.active, "MP4Token: mediator not active");
        require(slashAmount <= stake.amount, "MP4Token: slash exceeds stake");
        
        stake.amount -= slashAmount;
        stake.slashed = true;
        stake.active = false;
        
        totalStaked -= slashAmount;
        
        // Queimar tokens slashed
        _burn(address(this), slashAmount);
        
        emit MediatorSlashed(mediator, slashAmount, reason);
    }
    
    /**
     * @notice Distribuir recompensas para mediador
     * @param mediator Endereço do mediador
     * @param amount Quantidade de recompensa
     */
    function distributeMediatorReward(
        address mediator,
        uint256 amount
    ) external onlyAuthorizedMinter {
        require(mediatorStakes[mediator].active, "MP4Token: mediator not active");
        require(amount <= mediatorRewardPool, "MP4Token: insufficient reward pool");
        
        mediatorRewardPool -= amount;
        mediatorStakes[mediator].rewardsEarned += amount;
        
        _mint(mediator, amount);
        
        emit RewardsDistributed(mediator, amount);
    }
    
    // =============================================================
    //                   FUNÇÕES DE PAGAMENTO
    // =============================================================
    
    /**
     * @notice Pagar taxa usando tokens MP4 (com desconto)
     * @param amount Quantidade de tokens a pagar
     * @return discountApplied Desconto aplicado
     */
    function payWithMP4(uint256 amount) external returns (uint256 discountApplied) {
        require(balanceOf(msg.sender) >= amount, "MP4Token: insufficient balance");
        
        discountApplied = (amount * paymentDiscount) / 10000;
        
        // Queimar tokens pagos
        _burn(msg.sender, amount);
        
        // Adicionar parte ao pool de recompensas
        mediatorRewardPool += discountApplied / 2;
        
        emit PaymentMade(msg.sender, amount, discountApplied);
    }
    
    // =============================================================
    //                 FUNÇÕES ADMINISTRATIVAS
    // =============================================================
    
    /**
     * @notice Autorizar endereço para mint
     * @param minter Endereço a autorizar
     * @param authorized Status de autorização
     */
    function setAuthorizedMinter(
        address minter,
        bool authorized
    ) external onlyOwner {
        authorizedMinters[minter] = authorized;
    }
    
    /**
     * @notice Definir desconto para pagamentos em MP4
     * @param newDiscount Novo desconto em basis points
     */
    function setPaymentDiscount(uint256 newDiscount) external onlyOwner {
        require(newDiscount <= 5000, "MP4Token: discount too high"); // Máximo 50%
        paymentDiscount = newDiscount;
    }
    
    /**
     * @notice Definir stake mínimo para mediadores
     * @param newMinimum Novo valor mínimo
     */
    function setMinimumMediatorStake(uint256 newMinimum) external onlyOwner {
        minimumMediatorStake = newMinimum;
    }
    
    /**
     * @notice Mint tokens para recompensas (apenas contratos autorizados)
     * @param to Endereço de destino
     * @param amount Quantidade a mintar
     */
    function mintReward(address to, uint256 amount) external onlyAuthorizedMinter {
        require(totalSupply() + amount <= MAX_SUPPLY, "MP4Token: exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @notice Adicionar fundos ao pool de recompensas
     * @param amount Quantidade a adicionar
     */
    function addToRewardPool(uint256 amount) external onlyOwner {
        mediatorRewardPool += amount;
    }
    
    /**
     * @notice Pausar/despausar token
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // =============================================================
    //                   FUNÇÕES DE CONSULTA
    // =============================================================
    
    /**
     * @notice Verificar se endereço pode ser mediador
     * @param account Endereço a verificar
     * @return True se pode mediar
     */
    function canMediate(address account) external view returns (bool) {
        return mediatorStakes[account].active && 
               mediatorStakes[account].amount >= minimumMediatorStake;
    }
    
    /**
     * @notice Obter informações de proposta
     * @param proposalId ID da proposta
     * @return id ID da proposta
     * @return proposer Endereço do proponente
     * @return description Descrição
     * @return forVotes Votos a favor
     * @return againstVotes Votos contra
     * @return startTime Início da votação
     * @return endTime Fim da votação
     * @return executed Se foi executada
     * @return cancelled Se foi cancelada
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startTime,
        uint256 endTime,
        bool executed,
        bool cancelled
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.cancelled
        );
    }
    
    /**
     * @notice Calcular desconto para pagamento em MP4
     * @param baseAmount Valor base em wei
     * @return discountedAmount Valor com desconto
     * @return tokenAmount Quantidade de tokens necessária
     */
    function calculatePaymentDiscount(
        uint256 baseAmount
    ) external view returns (uint256 discountedAmount, uint256 tokenAmount) {
        discountedAmount = baseAmount - (baseAmount * paymentDiscount / 10000);
        // Assumindo 1 MP4 = 0.001 ETH para conversão
        tokenAmount = baseAmount / (10**15);
    }
    
    // =============================================================
    //                   OVERRIDES NECESSÁRIOS
    // =============================================================
    
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable, ERC20Votes) {
        super._update(from, to, value);
    }
    
    // Override necessário para ERC20Votes
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
