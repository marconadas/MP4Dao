// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IMusicNFT {
    function mintForWork(uint256 workId, address to, string calldata tokenURI) external returns (uint256 tokenId);
}

/**
 * @title WorkRegistry
 * @notice Registo probatório de obras musicais para Angola
 * @dev Contrato principal para registo de copyright musical
 * 
 * Funcionalidades:
 * - Registo de obras com hash SHA-256
 * - Gestão de coautoria com splits percentuais
 * - Sistema de disputas e mediação
 * - Metadados IPFS/Arweave
 * - Conformidade com Lei n.º 15/14 (Angola)
 */
contract WorkRegistry is Ownable, ReentrancyGuard, Pausable {
    
    // =============================================================
    //                        ESTRUTURAS
    // =============================================================
    
    /**
     * @dev Estrutura principal de uma obra registada
     */
    struct Work {
        bytes32 workHash;          // SHA-256 do bundle encriptado
        string metadataURI;        // CID/URL de metadados (IPFS/Arweave)
        address[] authors;         // Carteiras dos autores
        uint16[] splitsBps;        // Percentagens em basis points (10000 = 100%)
        uint64 registeredAt;       // Timestamp do registo
        uint32 workType;           // Tipo de obra (música, letra, etc.)
        bool disputed;             // Marcador de disputa ativa
        bool publicListing;        // Obra listada publicamente
    }
    
    /**
     * @dev Estrutura de uma disputa
     */
    struct Dispute {
        uint256 workId;            // ID da obra em disputa
        address claimant;          // Quem iniciou a disputa
        string reason;             // Razão da disputa
        string evidenceURI;        // URI das evidências
        uint64 createdAt;          // Timestamp da criação
        uint64 resolvedAt;         // Timestamp da resolução
        DisputeStatus status;      // Estado atual da disputa
        address[] assignedMediators;  // NOVO: Múltiplos mediadores
        mapping(address => bool) mediatorVotes; // NOVO: Votos dos mediadores
        uint256 votesFor;          // NOVO: Votos a favor do claimant
        uint256 votesAgainst;      // NOVO: Votos contra o claimant
        uint256 mediationDeadline; // NOVO: Prazo para mediação
    }
    
    /**
     * @dev Struct para retorno de dados de disputa (sem mapping)
     */
    struct DisputeView {
        uint256 workId;
        address claimant;
        string reason;
        string evidenceURI;
        uint64 createdAt;
        uint64 resolvedAt;
        DisputeStatus status;
        address[] assignedMediators;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 mediationDeadline;
    }
    
    /**
     * @dev Estados possíveis de uma disputa
     */
    enum DisputeStatus {
        PENDING,        // Aguardando resposta
        UNDER_REVIEW,   // Em análise
        MEDIATION,      // Em mediação
        RESOLVED,       // Resolvida
        ESCALATED,      // Escalada para tribunal
        DISMISSED       // Rejeitada
    }
    
    /**
     * @dev Tipos de obras suportados
     */
    enum WorkType {
        MUSIC,          // Obra musical completa
        LYRICS,         // Apenas letra
        INSTRUMENTAL,   // Apenas instrumental
        REMIX,          // Remix de obra existente
        COVER,          // Cover de obra existente
        SAMPLE,         // Sample/Loop
        ALBUM,          // Álbum completo
        EP,             // Extended Play
        SINGLE,         // Single
        COMPILATION,    // Compilação
        SOUNDTRACK      // Banda sonora
    }
    
    // =============================================================
    //                     VARIÁVEIS DE ESTADO
    // =============================================================
    
    /// @dev Mapeamento de ID da obra para dados da obra
    mapping(uint256 => Work) private _works;
    
    /// @dev Mapeamento de hash da obra para ID
    mapping(bytes32 => uint256) public workIdByHash;
    
    /// @dev Mapeamento de ID da disputa para dados da disputa
    mapping(uint256 => Dispute) private _disputes;
    
    /// @dev Contador de obras registadas
    uint256 public workCount;
    
    /// @dev Contador de disputas
    uint256 public disputeCount;
    
    /// @dev Taxa de registo em wei
    uint256 public registrationFee = 0.001 ether;
    
    /// @dev Taxa de disputa em wei
    uint256 public disputeFee = 0.01 ether;
    
    /// @dev Endereços autorizados como mediadores
    mapping(address => bool) public authorizedMediators;
    
    /// @dev Prazo para resposta em disputas (em segundos)
    uint256 public disputeResponseTime = 10 days;
    
    /// @dev Contrato NFT associado
    IMusicNFT public musicNFTContract;
    
    /// @dev Se deve mintar NFT automaticamente
    bool public autoMintNFT = true;
    
    /// @dev Número mínimo de mediadores para uma disputa
    uint256 public constant MIN_MEDIATORS = 3;
    uint256 public constant MEDIATION_PERIOD = 14 days;
    
    /// @dev Pool de mediadores qualificados
    address[] public mediatorPool;
    mapping(address => uint256) public mediatorReputation;
    
    /// @dev Referência ao token MP4 para verificar qualificação de mediadores
    address public mp4TokenContract;
    
    // =============================================================
    //                         EVENTOS
    // =============================================================
    
    /**
     * @dev Emitido quando uma obra é registada
     */
    event WorkRegistered(
        uint256 indexed workId,
        bytes32 indexed workHash,
        string metadataURI,
        address[] authors,
        uint16[] splitsBps,
        uint32 workType,
        uint64 timestamp,
        bool publicListing
    );
    
    /**
     * @dev Emitido quando metadados são atualizados
     */
    event MetadataUpdated(
        uint256 indexed workId,
        string newMetadataURI,
        address indexed updatedBy
    );
    
    /**
     * @dev Emitido quando uma disputa é criada
     */
    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed workId,
        address indexed claimant,
        string reason
    );
    
    /**
     * @dev Emitido quando uma disputa é resolvida
     */
    event DisputeResolved(
        uint256 indexed disputeId,
        uint256 indexed workId,
        DisputeStatus status,
        address indexed mediator
    );
    
    /**
     * @dev Emitido quando taxas são atualizadas
     */
    event FeesUpdated(
        uint256 newRegistrationFee,
        uint256 newDisputeFee
    );
    
    /**
     * @dev Emitido quando NFT é mintado para uma obra
     */
    event NFTMinted(
        uint256 indexed workId,
        uint256 indexed tokenId,
        address indexed to
    );
    
    /**
     * @dev Emitido quando mediadores são designados para uma disputa
     */
    event MediatorsAssigned(
        uint256 indexed disputeId,
        address[] mediators
    );
    
    /**
     * @dev Emitido quando um mediador vota numa disputa
     */
    event MediatorVoted(
        uint256 indexed disputeId,
        address indexed mediator,
        bool support,
        string justification
    );
    
    // =============================================================
    //                       MODIFICADORES
    // =============================================================
    
    /**
     * @dev Verifica se o caller é autor da obra
     */
    modifier onlyAuthor(uint256 workId) {
        require(_isAuthor(workId, msg.sender), "WorkRegistry: not an author");
        _;
    }
    
    /**
     * @dev Verifica se o caller é mediador autorizado
     */
    modifier onlyMediator() {
        require(authorizedMediators[msg.sender], "WorkRegistry: not authorized mediator");
        _;
    }
    
    /**
     * @dev Verifica se a obra existe
     */
    modifier workExists(uint256 workId) {
        require(workId > 0 && workId <= workCount, "WorkRegistry: work does not exist");
        _;
    }
    
    /**
     * @dev Verifica se a disputa existe
     */
    modifier disputeExists(uint256 disputeId) {
        require(disputeId > 0 && disputeId <= disputeCount, "WorkRegistry: dispute does not exist");
        _;
    }
    
    // =============================================================
    //                       CONSTRUTOR
    // =============================================================
    
    constructor(address initialOwner) Ownable(initialOwner) {
        // Adicionar o owner como mediador inicial
        authorizedMediators[initialOwner] = true;
    }
    
    // =============================================================
    //                   FUNÇÕES PRINCIPAIS
    // =============================================================
    
    /**
     * @notice Registar uma nova obra musical
     * @param workHash Hash SHA-256 da obra encriptada
     * @param metadataURI URI dos metadados (IPFS/Arweave)
     * @param authors Array de endereços dos autores
     * @param splitsBps Array de percentagens em basis points
     * @param workType Tipo da obra (música, letra, etc.)
     * @param publicListing Se a obra deve ser listada publicamente
     * @return workId ID único da obra registada
     */
    function registerWork(
        bytes32 workHash,
        string calldata metadataURI,
        address[] calldata authors,
        uint16[] calldata splitsBps,
        uint32 workType,
        bool publicListing
    ) external payable nonReentrant whenNotPaused returns (uint256 workId) {
        // Validações
        require(msg.value >= registrationFee, "WorkRegistry: insufficient fee");
        require(workHash != bytes32(0), "WorkRegistry: invalid hash");
        require(bytes(metadataURI).length > 0, "WorkRegistry: empty metadata URI");
        require(authors.length > 0 && authors.length <= 10, "WorkRegistry: invalid authors array");
        require(authors.length == splitsBps.length, "WorkRegistry: arrays length mismatch");
        require(workType < 11, "WorkRegistry: invalid work type");
        require(workIdByHash[workHash] == 0, "WorkRegistry: hash already registered");
        
        // Validar splits e verificar se sender é autor
        uint256 totalSplits = 0;
        bool senderIsAuthor = false;
        
        for (uint256 i = 0; i < authors.length; i++) {
            require(authors[i] != address(0), "WorkRegistry: zero address author");
            totalSplits += splitsBps[i];
            if (authors[i] == msg.sender) {
                senderIsAuthor = true;
            }
        }
        
        require(totalSplits == 10000, "WorkRegistry: splits must sum to 10000 bps");
        require(senderIsAuthor, "WorkRegistry: sender must be an author");
        
        // Incrementar contador e criar obra
        workId = ++workCount;
        
        // Criar arrays de cópia para storage
        address[] memory authorsArray = new address[](authors.length);
        uint16[] memory splitsArray = new uint16[](splitsBps.length);
        
        for (uint256 i = 0; i < authors.length; i++) {
            authorsArray[i] = authors[i];
            splitsArray[i] = splitsBps[i];
        }
        
        // Armazenar obra
        _works[workId] = Work({
            workHash: workHash,
            metadataURI: metadataURI,
            authors: authorsArray,
            splitsBps: splitsArray,
            registeredAt: uint64(block.timestamp),
            workType: workType,
            disputed: false,
            publicListing: publicListing
        });
        
        // Mapear hash para ID
        workIdByHash[workHash] = workId;
        
        // Emitir evento
        emit WorkRegistered(
            workId,
            workHash,
            metadataURI,
            authorsArray,
            splitsArray,
            workType,
            uint64(block.timestamp),
            publicListing
        );
        
        // Mintar NFT se configurado
        if (autoMintNFT && address(musicNFTContract) != address(0)) {
            try musicNFTContract.mintForWork(workId, msg.sender, metadataURI) returns (uint256 tokenId) {
                emit NFTMinted(workId, tokenId, msg.sender);
            } catch {
                // NFT mint falhou, mas obra foi registrada com sucesso
                // Não revertemos a transação
            }
        }
        
        // CORREÇÃO CEI: Calcular reembolso antes das interações
        uint256 excessAmount = 0;
        if (msg.value > registrationFee) {
            excessAmount = msg.value - registrationFee;
        }
        
        // INTERACTIONS: Reembolsar excesso por último
        if (excessAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: excessAmount}("");
            require(success, "WorkRegistry: refund failed");
        }
    }
    
    /**
     * @notice Atualizar metadados de uma obra (apenas autores)
     * @param workId ID da obra
     * @param newMetadataURI Nova URI dos metadados
     */
    function updateMetadata(
        uint256 workId,
        string calldata newMetadataURI
    ) external workExists(workId) onlyAuthor(workId) whenNotPaused {
        require(bytes(newMetadataURI).length > 0, "WorkRegistry: empty metadata URI");
        require(!_works[workId].disputed, "WorkRegistry: work is disputed");
        
        _works[workId].metadataURI = newMetadataURI;
        
        emit MetadataUpdated(workId, newMetadataURI, msg.sender);
    }
    
    /**
     * @notice Criar uma disputa sobre uma obra
     * @param workId ID da obra
     * @param reason Razão da disputa
     * @param evidenceURI URI das evidências
     * @return disputeId ID único da disputa
     */
    function createDispute(
        uint256 workId,
        string calldata reason,
        string calldata evidenceURI
    ) external payable nonReentrant workExists(workId) whenNotPaused returns (uint256 disputeId) {
        require(msg.value >= disputeFee, "WorkRegistry: insufficient dispute fee");
        require(bytes(reason).length > 0, "WorkRegistry: empty reason");
        require(!_isAuthor(workId, msg.sender), "WorkRegistry: authors cannot dispute own work");
        
        disputeId = ++disputeCount;
        
        // Selecionar mediadores aleatoriamente
        address[] memory selectedMediators = _selectRandomMediators(MIN_MEDIATORS);
        require(selectedMediators.length >= MIN_MEDIATORS, "WorkRegistry: insufficient mediators");
        
        Dispute storage dispute = _disputes[disputeId];
        dispute.workId = workId;
        dispute.claimant = msg.sender;
        dispute.reason = reason;
        dispute.evidenceURI = evidenceURI;
        dispute.createdAt = uint64(block.timestamp);
        dispute.status = DisputeStatus.UNDER_REVIEW;
        dispute.assignedMediators = selectedMediators;
        dispute.mediationDeadline = block.timestamp + MEDIATION_PERIOD;
        
        // Marcar obra como disputada
        _works[workId].disputed = true;
        
        emit DisputeCreated(disputeId, workId, msg.sender, reason);
        emit MediatorsAssigned(disputeId, selectedMediators);
        
        // CORREÇÃO CEI: Calcular reembolso antes das interações
        uint256 excessAmount = 0;
        if (msg.value > disputeFee) {
            excessAmount = msg.value - disputeFee;
        }
        
        // INTERACTIONS: Reembolsar excesso por último
        if (excessAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: excessAmount}("");
            require(success, "WorkRegistry: refund failed");
        }
    }
    
    // =============================================================
    //                   FUNÇÕES DE CONSULTA
    // =============================================================
    
    /**
     * @notice Obter dados completos de uma obra
     * @param workId ID da obra
     * @return work Estrutura completa da obra
     */
    function getWork(uint256 workId) external view workExists(workId) returns (Work memory work) {
        return _works[workId];
    }
    
    /**
     * @notice Verificar se um endereço é autor de uma obra
     * @param workId ID da obra
     * @param account Endereço a verificar
     * @return isAuthor True se for autor
     */
    function isAuthor(uint256 workId, address account) external view workExists(workId) returns (bool) {
        return _isAuthor(workId, account);
    }
    
    /**
     * @notice Obter dados de uma disputa
     * @param disputeId ID da disputa
     * @return dispute Estrutura completa da disputa
     */
    function getDispute(uint256 disputeId) external view disputeExists(disputeId) returns (DisputeView memory dispute) {
        Dispute storage _dispute = _disputes[disputeId];
        return DisputeView({
            workId: _dispute.workId,
            claimant: _dispute.claimant,
            reason: _dispute.reason,
            evidenceURI: _dispute.evidenceURI,
            createdAt: _dispute.createdAt,
            resolvedAt: _dispute.resolvedAt,
            status: _dispute.status,
            assignedMediators: _dispute.assignedMediators,
            votesFor: _dispute.votesFor,
            votesAgainst: _dispute.votesAgainst,
            mediationDeadline: _dispute.mediationDeadline
        });
    }
    
    /**
     * @notice Obter obras de um autor
     * @param author Endereço do autor
     * @return workIds Array de IDs das obras
     */
    function getWorksByAuthor(address author) external view returns (uint256[] memory workIds) {
        uint256 count = 0;
        
        // Primeiro, contar quantas obras o autor tem
        for (uint256 i = 1; i <= workCount; i++) {
            if (_isAuthor(i, author)) {
                count++;
            }
        }
        
        // Criar array e preencher
        workIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= workCount; i++) {
            if (_isAuthor(i, author)) {
                workIds[index] = i;
                index++;
            }
        }
    }
    
    // =============================================================
    //                 FUNÇÕES ADMINISTRATIVAS
    // =============================================================
    
    /**
     * @notice Definir taxas de registo e disputa (apenas owner)
     * @param newRegistrationFee Nova taxa de registo
     * @param newDisputeFee Nova taxa de disputa
     */
    function setFees(
        uint256 newRegistrationFee,
        uint256 newDisputeFee
    ) external onlyOwner {
        registrationFee = newRegistrationFee;
        disputeFee = newDisputeFee;
        
        emit FeesUpdated(newRegistrationFee, newDisputeFee);
    }
    
    /**
     * @notice Autorizar/desautorizar mediador
     * @param mediator Endereço do mediador
     * @param authorized Status de autorização
     */
    function setMediatorAuthorization(
        address mediator,
        bool authorized
    ) external onlyOwner {
        authorizedMediators[mediator] = authorized;
    }
    
    /**
     * @notice Definir contrato NFT
     * @param nftContract Endereço do contrato NFT
     */
    function setMusicNFTContract(address nftContract) external onlyOwner {
        musicNFTContract = IMusicNFT(nftContract);
    }
    
    /**
     * @notice Configurar mint automático de NFT
     * @param enabled Se deve mintar automaticamente
     */
    function setAutoMintNFT(bool enabled) external onlyOwner {
        autoMintNFT = enabled;
    }
    
    /**
     * @notice Resolver disputa (apenas mediadores)
     * @param disputeId ID da disputa
     * @param status Novo status da disputa
     */
    function resolveDispute(
        uint256 disputeId,
        DisputeStatus status
    ) external disputeExists(disputeId) onlyMediator {
        require(
            status == DisputeStatus.RESOLVED ||
            status == DisputeStatus.ESCALATED ||
            status == DisputeStatus.DISMISSED,
            "WorkRegistry: invalid resolution status"
        );
        
        Dispute storage dispute = _disputes[disputeId];
        require(dispute.status != DisputeStatus.RESOLVED, "WorkRegistry: already resolved");
        
        dispute.status = status;
        dispute.resolvedAt = uint64(block.timestamp);
        
        // Se resolvida ou rejeitada, remover marca de disputa da obra
        if (status == DisputeStatus.RESOLVED || status == DisputeStatus.DISMISSED) {
            _works[dispute.workId].disputed = false;
        }
        
        emit DisputeResolved(disputeId, dispute.workId, status, msg.sender);
    }
    
    /**
     * @notice Pausar/despausar contrato (apenas owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Retirar fundos do contrato (apenas owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "WorkRegistry: no funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    // =============================================================
    //                   FUNÇÕES INTERNAS
    // =============================================================
    
    /**
     * @dev Verificar se um endereço é autor de uma obra
     */
    function _isAuthor(uint256 workId, address account) internal view returns (bool) {
        address[] storage authors = _works[workId].authors;
        for (uint256 i = 0; i < authors.length; i++) {
            if (authors[i] == account) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @notice Votar numa resolução de mediação
     * @param disputeId ID da disputa
     * @param supportClaimant True para apoiar o reclamante
     * @param justification Justificação do voto
     */
    function voteMediationResolution(
        uint256 disputeId,
        bool supportClaimant,
        string calldata justification
    ) external disputeExists(disputeId) {
        Dispute storage dispute = _disputes[disputeId];
        
        require(dispute.status == DisputeStatus.UNDER_REVIEW, "WorkRegistry: not in mediation");
        require(block.timestamp <= dispute.mediationDeadline, "WorkRegistry: mediation expired");
        require(_isMediatorAssigned(disputeId, msg.sender), "WorkRegistry: not assigned mediator");
        require(!dispute.mediatorVotes[msg.sender], "WorkRegistry: already voted");
        
        // Verificar se mediador ainda está qualificado (se MP4Token está configurado)
        if (mp4TokenContract != address(0)) {
            (bool success, bytes memory result) = mp4TokenContract.staticcall(
                abi.encodeWithSignature("canMediate(address)", msg.sender)
            );
            require(success && abi.decode(result, (bool)), "WorkRegistry: mediator not qualified");
        }
        
        dispute.mediatorVotes[msg.sender] = true;
        
        if (supportClaimant) {
            dispute.votesFor++;
        } else {
            dispute.votesAgainst++;
        }
        
        emit MediatorVoted(disputeId, msg.sender, supportClaimant, justification);
        
        // Verificar se todos mediadores votaram
        if (dispute.votesFor + dispute.votesAgainst == dispute.assignedMediators.length) {
            _finalizeMediationVoting(disputeId);
        }
    }
    
    /**
     * @dev Selecionar mediadores aleatoriamente
     */
    function _selectRandomMediators(uint256 count) internal view returns (address[] memory) {
        require(mediatorPool.length >= count, "WorkRegistry: insufficient mediator pool");
        
        address[] memory selected = new address[](count);
        uint256 poolSize = mediatorPool.length;
        
        // Algoritmo de seleção pseudoaleatória
        for (uint256 i = 0; i < count; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                i
            ))) % poolSize;
            
            selected[i] = mediatorPool[randomIndex];
        }
        
        return selected;
    }
    
    /**
     * @dev Finalizar votação de mediação
     */
    function _finalizeMediationVoting(uint256 disputeId) internal {
        Dispute storage dispute = _disputes[disputeId];
        
        DisputeStatus finalStatus;
        
        if (dispute.votesFor > dispute.votesAgainst) {
            finalStatus = DisputeStatus.RESOLVED; // Claimant venceu
        } else {
            finalStatus = DisputeStatus.DISMISSED; // Disputa rejeitada
        }
        
        dispute.status = finalStatus;
        dispute.resolvedAt = uint64(block.timestamp);
        
        // Remover marca de disputa se resolvida
        if (finalStatus == DisputeStatus.RESOLVED || finalStatus == DisputeStatus.DISMISSED) {
            _works[dispute.workId].disputed = false;
        }
        
        // Distribuir recompensas/penalidades aos mediadores
        _distributeMediationRewards(disputeId);
        
        emit DisputeResolved(disputeId, dispute.workId, finalStatus, address(0));
    }
    
    /**
     * @dev Verificar se mediador está designado para disputa
     */
    function _isMediatorAssigned(uint256 disputeId, address mediator) internal view returns (bool) {
        address[] storage assigned = _disputes[disputeId].assignedMediators;
        for (uint256 i = 0; i < assigned.length; i++) {
            if (assigned[i] == mediator) return true;
        }
        return false;
    }
    
    /**
     * @dev Distribuir recompensas de mediação
     */
    function _distributeMediationRewards(uint256 disputeId) internal {
        Dispute storage dispute = _disputes[disputeId];
        uint256 rewardPerMediator = disputeFee / dispute.assignedMediators.length;
        
        for (uint256 i = 0; i < dispute.assignedMediators.length; i++) {
            address mediator = dispute.assignedMediators[i];
            
            // Aumentar reputação se votou com a maioria
            bool votedWithMajority = (dispute.votesFor > dispute.votesAgainst) ? 
                dispute.mediatorVotes[mediator] : !dispute.mediatorVotes[mediator];
            
            if (votedWithMajority) {
                mediatorReputation[mediator] += 10;
                
                // Enviar recompensa se MP4Token está configurado
                if (mp4TokenContract != address(0)) {
                    (bool success, ) = mp4TokenContract.call(
                        abi.encodeWithSignature(
                            "distributeMediatorReward(address,uint256)", 
                            mediator, 
                            rewardPerMediator
                        )
                    );
                    // Não reverter se falhar - apenas log
                    if (!success) {
                        // Log do erro poderia ser adicionado aqui
                    }
                }
            } else {
                // Penalizar levemente por votar contra a maioria
                if (mediatorReputation[mediator] > 5) {
                    mediatorReputation[mediator] -= 5;
                }
            }
        }
    }
    
    /**
     * @notice Configurar contrato MP4Token (apenas owner)
     * @param tokenContract Endereço do contrato MP4Token
     */
    function setMP4TokenContract(address tokenContract) external onlyOwner {
        mp4TokenContract = tokenContract;
    }
    
    /**
     * @notice Adicionar mediador ao pool (apenas owner)
     * @param mediator Endereço do mediador
     */
    function addMediatorToPool(address mediator) external onlyOwner {
        require(mediator != address(0), "WorkRegistry: invalid mediator");
        
        // Verificar se já está no pool
        for (uint256 i = 0; i < mediatorPool.length; i++) {
            require(mediatorPool[i] != mediator, "WorkRegistry: mediator already in pool");
        }
        
        mediatorPool.push(mediator);
        mediatorReputation[mediator] = 100; // Reputação inicial
    }
    
    /**
     * @notice Remover mediador do pool (apenas owner)
     * @param mediator Endereço do mediador
     */
    function removeMediatorFromPool(address mediator) external onlyOwner {
        for (uint256 i = 0; i < mediatorPool.length; i++) {
            if (mediatorPool[i] == mediator) {
                mediatorPool[i] = mediatorPool[mediatorPool.length - 1];
                mediatorPool.pop();
                delete mediatorReputation[mediator];
                break;
            }
        }
    }
}
