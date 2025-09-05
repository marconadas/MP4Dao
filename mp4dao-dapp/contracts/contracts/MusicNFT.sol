// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./WorkRegistry.sol";

/**
 * @title MusicNFT
 * @notice NFTs para obras musicais registradas no WorkRegistry
 * @dev Contrato ERC-721 que cria NFTs automaticamente para obras registradas
 * 
 * Funcionalidades:
 * - Mint automático de NFTs quando obra é registrada
 * - Metadados dinâmicos baseados no WorkRegistry
 * - Suporte para royalties dos autores
 * - Marketplace integrado para compra/venda
 * - Conformidade com padrões ERC-721 e ERC-2981
 */
contract MusicNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, ReentrancyGuard, Pausable {
    
    // =============================================================
    //                        ESTRUTURAS
    // =============================================================
    
    /**
     * @dev Informações do NFT musical
     */
    struct MusicToken {
        uint256 workId;           // ID da obra no WorkRegistry
        address[] authors;        // Autores da obra
        uint16[] royaltiesBps;    // Royalties em basis points
        uint256 price;            // Preço de venda (0 = não à venda)
        bool forSale;             // Se está à venda
        uint64 mintedAt;          // Timestamp do mint
    }
    
    /**
     * @dev Estrutura de oferta
     */
    struct Offer {
        address buyer;            // Comprador
        uint256 amount;           // Valor oferecido
        uint64 expiresAt;         // Timestamp de expiração
        bool active;              // Se a oferta está ativa
    }
    
    // =============================================================
    //                     VARIÁVEIS DE ESTADO
    // =============================================================
    
    /// @dev Referência para o contrato WorkRegistry
    WorkRegistry public immutable workRegistry;
    
    /// @dev Mapeamento de tokenId para informações do token
    mapping(uint256 => MusicToken) private _musicTokens;
    
    /// @dev Mapeamento de workId para tokenId
    mapping(uint256 => uint256) public tokenIdByWorkId;
    
    /// @dev Mapeamento de tokenId para ofertas
    mapping(uint256 => mapping(address => Offer)) public offers;
    
    /// @dev Contador de tokens
    uint256 private _tokenIdCounter;
    
    /// @dev Taxa da plataforma em basis points (250 = 2.5%)
    uint256 public platformFeeBps = 250;
    
    /// @dev Endereço que recebe as taxas da plataforma
    address public feeRecipient;
    
    /// @dev Royalties padrão em basis points (1000 = 10%)
    uint256 public defaultRoyaltiesBps = 1000;
    
    // =============================================================
    //                         EVENTOS
    // =============================================================
    
    /**
     * @dev Emitido quando um NFT musical é mintado
     */
    event MusicNFTMinted(
        uint256 indexed tokenId,
        uint256 indexed workId,
        address indexed to,
        string tokenURI
    );
    
    /**
     * @dev Emitido quando um NFT é colocado à venda
     */
    event TokenListedForSale(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    
    /**
     * @dev Emitido quando um NFT é removido da venda
     */
    event TokenRemovedFromSale(
        uint256 indexed tokenId,
        address indexed seller
    );
    
    /**
     * @dev Emitido quando um NFT é vendido
     */
    event TokenSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    
    /**
     * @dev Emitido quando uma oferta é feita
     */
    event OfferMade(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 amount,
        uint64 expiresAt
    );
    
    /**
     * @dev Emitido quando uma oferta é aceita
     */
    event OfferAccepted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 amount
    );
    
    /**
     * @dev Emitido quando royalties são pagos
     */
    event RoyaltiesPaid(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 amount
    );
    
    // =============================================================
    //                       MODIFICADORES
    // =============================================================
    
    /**
     * @dev Verifica se o token existe
     */
    modifier tokenExists(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "MusicNFT: token does not exist");
        _;
    }
    
    /**
     * @dev Verifica se o caller é dono do token
     */
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "MusicNFT: not token owner");
        _;
    }
    
    /**
     * @dev Verifica se o caller é autor da obra
     */
    modifier onlyAuthor(uint256 workId) {
        require(workRegistry.isAuthor(workId, msg.sender), "MusicNFT: not an author");
        _;
    }
    
    // =============================================================
    //                       CONSTRUTOR
    // =============================================================
    
    constructor(
        address _workRegistry,
        address _feeRecipient,
        address initialOwner
    ) ERC721("MP4DAO Music NFT", "MP4NFT") Ownable(initialOwner) {
        require(_workRegistry != address(0), "MusicNFT: invalid registry address");
        require(_feeRecipient != address(0), "MusicNFT: invalid fee recipient");
        
        workRegistry = WorkRegistry(_workRegistry);
        feeRecipient = _feeRecipient;
    }
    
    // =============================================================
    //                   FUNÇÕES PRINCIPAIS
    // =============================================================
    
    /**
     * @notice Mintar NFT para uma obra registrada
     * @param workId ID da obra no WorkRegistry
     * @param to Endereço que receberá o NFT
     * @param _tokenURI URI dos metadados do NFT
     * @return tokenId ID do token mintado
     */
    function mintForWork(
        uint256 workId,
        address to,
        string calldata _tokenURI
    ) external onlyAuthor(workId) whenNotPaused returns (uint256 tokenId) {
        require(to != address(0), "MusicNFT: mint to zero address");
        require(tokenIdByWorkId[workId] == 0, "MusicNFT: NFT already minted for this work");
        require(bytes(_tokenURI).length > 0, "MusicNFT: empty token URI");
        
        // Obter dados da obra
        WorkRegistry.Work memory work = workRegistry.getWork(workId);
        require(!work.disputed, "MusicNFT: cannot mint for disputed work");
        
        // Incrementar contador e mintar
        tokenId = ++_tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // Armazenar informações do token
        _musicTokens[tokenId] = MusicToken({
            workId: workId,
            authors: work.authors,
            royaltiesBps: work.splitsBps,
            price: 0,
            forSale: false,
            mintedAt: uint64(block.timestamp)
        });
        
        // Mapear workId para tokenId
        tokenIdByWorkId[workId] = tokenId;
        
        emit MusicNFTMinted(tokenId, workId, to, _tokenURI);
    }
    
    /**
     * @notice Colocar NFT à venda
     * @param tokenId ID do token
     * @param price Preço em wei
     */
    function listForSale(
        uint256 tokenId,
        uint256 price
    ) external tokenExists(tokenId) onlyTokenOwner(tokenId) whenNotPaused {
        require(price > 0, "MusicNFT: price must be greater than zero");
        
        _musicTokens[tokenId].price = price;
        _musicTokens[tokenId].forSale = true;
        
        emit TokenListedForSale(tokenId, msg.sender, price);
    }
    
    /**
     * @notice Remover NFT da venda
     * @param tokenId ID do token
     */
    function removeFromSale(
        uint256 tokenId
    ) external tokenExists(tokenId) onlyTokenOwner(tokenId) {
        _musicTokens[tokenId].price = 0;
        _musicTokens[tokenId].forSale = false;
        
        emit TokenRemovedFromSale(tokenId, msg.sender);
    }
    
    /**
     * @notice Comprar NFT que está à venda
     * @param tokenId ID do token
     */
    function buyToken(uint256 tokenId) external payable nonReentrant tokenExists(tokenId) whenNotPaused {
        MusicToken storage token = _musicTokens[tokenId];
        
        // CHECKS - Todas as validações primeiro
        require(token.forSale, "MusicNFT: token not for sale");
        require(msg.value >= token.price, "MusicNFT: insufficient payment");
        
        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "MusicNFT: cannot buy own token");
        
        uint256 salePrice = token.price;
        uint256 excessAmount = msg.value > salePrice ? msg.value - salePrice : 0;
        
        // EFFECTS - Mudanças de estado
        token.price = 0;
        token.forSale = false;
        
        // Transferir NFT
        _transfer(seller, msg.sender, tokenId);
        
        emit TokenSold(tokenId, seller, msg.sender, salePrice);
        
        // INTERACTIONS - Chamadas externas por último
        _distributePayment(tokenId, salePrice, seller);
        
        // Reembolsar excesso
        if (excessAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: excessAmount}("");
            require(success, "MusicNFT: refund failed");
        }
    }
    
    /**
     * @notice Fazer oferta para um NFT
     * @param tokenId ID do token
     * @param expirationTime Timestamp de expiração da oferta
     */
    function makeOffer(
        uint256 tokenId,
        uint64 expirationTime
    ) external payable nonReentrant tokenExists(tokenId) whenNotPaused {
        require(msg.value > 0, "MusicNFT: offer must be greater than zero");
        require(expirationTime > block.timestamp, "MusicNFT: invalid expiration time");
        require(ownerOf(tokenId) != msg.sender, "MusicNFT: cannot offer on own token");
        
        // Reembolsar oferta anterior se existir
        Offer storage existingOffer = offers[tokenId][msg.sender];
        if (existingOffer.active && existingOffer.amount > 0) {
            payable(msg.sender).transfer(existingOffer.amount);
        }
        
        // Criar nova oferta
        offers[tokenId][msg.sender] = Offer({
            buyer: msg.sender,
            amount: msg.value,
            expiresAt: expirationTime,
            active: true
        });
        
        emit OfferMade(tokenId, msg.sender, msg.value, expirationTime);
    }
    
    /**
     * @notice Aceitar oferta para um NFT
     * @param tokenId ID do token
     * @param buyer Endereço do comprador
     */
    function acceptOffer(
        uint256 tokenId,
        address buyer
    ) external nonReentrant tokenExists(tokenId) onlyTokenOwner(tokenId) whenNotPaused {
        Offer storage offer = offers[tokenId][buyer];
        require(offer.active, "MusicNFT: offer not active");
        require(offer.expiresAt > block.timestamp, "MusicNFT: offer expired");
        
        uint256 offerAmount = offer.amount;
        
        // Limpar oferta
        offer.active = false;
        offer.amount = 0;
        
        // Remover token da venda se estava listado
        _musicTokens[tokenId].price = 0;
        _musicTokens[tokenId].forSale = false;
        
        // Transferir NFT
        _transfer(msg.sender, buyer, tokenId);
        
        // Distribuir pagamento
        _distributePayment(tokenId, offerAmount, msg.sender);
        
        emit OfferAccepted(tokenId, msg.sender, buyer, offerAmount);
    }
    
    // =============================================================
    //                   FUNÇÕES DE CONSULTA
    // =============================================================
    
    /**
     * @notice Obter informações de um token musical
     * @param tokenId ID do token
     * @return token Estrutura completa do token
     */
    function getMusicToken(uint256 tokenId) external view tokenExists(tokenId) returns (MusicToken memory token) {
        return _musicTokens[tokenId];
    }
    
    /**
     * @notice Verificar se um NFT está à venda
     * @param tokenId ID do token
     * @return forSale Se está à venda
     * @return price Preço atual
     */
    function getTokenSaleInfo(uint256 tokenId) external view tokenExists(tokenId) returns (bool forSale, uint256 price) {
        MusicToken storage token = _musicTokens[tokenId];
        return (token.forSale, token.price);
    }
    
    /**
     * @notice Obter oferta de um comprador para um token
     * @param tokenId ID do token
     * @param buyer Endereço do comprador
     * @return offer Estrutura da oferta
     */
    function getOffer(uint256 tokenId, address buyer) external view returns (Offer memory offer) {
        return offers[tokenId][buyer];
    }
    
    // =============================================================
    //                 FUNÇÕES ADMINISTRATIVAS
    // =============================================================
    
    /**
     * @notice Definir taxa da plataforma
     * @param newFeeBps Nova taxa em basis points
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "MusicNFT: fee too high"); // Máximo 10%
        platformFeeBps = newFeeBps;
    }
    
    /**
     * @notice Definir destinatário das taxas
     * @param newFeeRecipient Novo endereço
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "MusicNFT: invalid address");
        feeRecipient = newFeeRecipient;
    }
    
    /**
     * @notice Definir royalties padrão
     * @param newRoyaltiesBps Novos royalties em basis points
     */
    function setDefaultRoyalties(uint256 newRoyaltiesBps) external onlyOwner {
        require(newRoyaltiesBps <= 2500, "MusicNFT: royalties too high"); // Máximo 25%
        defaultRoyaltiesBps = newRoyaltiesBps;
    }
    
    /**
     * @notice Pausar/despausar contrato
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // =============================================================
    //                   FUNÇÕES INTERNAS
    // =============================================================
    
    /**
     * @dev Distribuir pagamento entre autores, plataforma e vendedor
     */
    function _distributePayment(uint256 tokenId, uint256 totalAmount, address seller) internal {
        MusicToken storage token = _musicTokens[tokenId];
        
        // Calcular taxa da plataforma
        uint256 platformFee = (totalAmount * platformFeeBps) / 10000;
        uint256 totalRoyaltiesDistributed = 0;
        
        // Arrays para batch transfers seguros
        address[] memory recipients = new address[](token.authors.length + 2); // +2 para platform e seller
        uint256[] memory amounts = new uint256[](token.authors.length + 2);
        uint256 recipientCount = 0;
        
        // CORREÇÃO: Calcular royalties individuais diretamente do valor total
        for (uint256 i = 0; i < token.authors.length; i++) {
            uint256 authorRoyalty = (totalAmount * token.royaltiesBps[i]) / 10000;
            if (authorRoyalty > 0) {
                recipients[recipientCount] = token.authors[i];
                amounts[recipientCount] = authorRoyalty;
                recipientCount++;
                totalRoyaltiesDistributed += authorRoyalty;
            }
        }
        
        // Preparar transferência da plataforma
        if (platformFee > 0) {
            recipients[recipientCount] = feeRecipient;
            amounts[recipientCount] = platformFee;
            recipientCount++;
        }
        
        // Preparar transferência do vendedor
        uint256 sellerAmount = totalAmount - platformFee - totalRoyaltiesDistributed;
        if (sellerAmount > 0) {
            recipients[recipientCount] = seller;
            amounts[recipientCount] = sellerAmount;
            recipientCount++;
        }
        
        // Executar todas as transferências usando padrão CEI
        for (uint256 i = 0; i < recipientCount; i++) {
            (bool success, ) = payable(recipients[i]).call{value: amounts[i]}("");
            require(success, "MusicNFT: transfer failed");
            
            // Emitir eventos apropriados para royalties
            if (i < token.authors.length) {
                emit RoyaltiesPaid(tokenId, recipients[i], amounts[i]);
            }
        }
    }
    
    // =============================================================
    //                  OVERRIDES NECESSÁRIOS
    // =============================================================
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _update(address to, uint256 tokenId, address auth) internal override whenNotPaused returns (address) {
        return super._update(to, tokenId, auth);
    }
}
