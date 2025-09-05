// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title MP4TimelockController
 * @notice Controlador de timelock para operações administrativas críticas
 * @dev Implementa delays obrigatórios para mudanças administrativas importantes
 * 
 * Funcionalidades:
 * - Delay mínimo de 2 dias para execução
 * - Múltiplos proposers (governança)
 * - Múltiplos executors (multisig)
 * - Cancelamento de operações pendentes
 */
contract MP4TimelockController is TimelockController {
    
    // =============================================================
    //                        CONSTANTES
    // =============================================================
    
    /// @dev Delay mínimo padrão (2 dias)
    uint256 public constant DEFAULT_MIN_DELAY = 2 days;
    
    /// @dev Delay para emergências (6 horas)
    uint256 public constant EMERGENCY_MIN_DELAY = 6 hours;
    
    // =============================================================
    //                       CONSTRUTOR
    // =============================================================
    
    /**
     * @notice Construtor do TimelockController
     * @param minDelay Delay mínimo em segundos
     * @param proposers Endereços autorizados a propor operações
     * @param executors Endereços autorizados a executar operações
     * @param admin Administrador inicial (pode ser renunciado)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {
        // Validações
        require(minDelay >= EMERGENCY_MIN_DELAY, "MP4Timelock: delay too short");
        require(proposers.length > 0, "MP4Timelock: no proposers");
        require(executors.length > 0, "MP4Timelock: no executors");
    }
    
    // =============================================================
    //                   FUNÇÕES ESPECIALIZADAS
    // =============================================================
    
    /**
     * @notice Programar mudança de taxa da plataforma
     * @param target Contrato alvo
     * @param newFee Nova taxa
     */
    function schedulePlatformFeeChange(
        address target,
        uint256 newFee
    ) external onlyRole(PROPOSER_ROLE) {
        bytes memory _data = abi.encodeWithSignature("setPlatformFee(uint256)", newFee);
        
        this.schedule(
            target,
            0,
            _data,
            bytes32(0),
            keccak256(abi.encodePacked("setPlatformFee", block.timestamp)),
            getMinDelay()
        );
        
        emit OperationScheduled("setPlatformFee", target, newFee, block.timestamp + getMinDelay());
    }
    
    /**
     * @notice Programar autorização/desautorização de minter
     * @param target Contrato alvo
     * @param minter Endereço do minter
     * @param authorized Status de autorização
     */
    function scheduleAuthorizedMinterChange(
        address target,
        address minter,
        bool authorized
    ) external onlyRole(PROPOSER_ROLE) {
        bytes memory _data = abi.encodeWithSignature(
            "setAuthorizedMinter(address,bool)", 
            minter, 
            authorized
        );
        
        this.schedule(
            target,
            0,
            _data,
            bytes32(0),
            keccak256(abi.encodePacked("setAuthorizedMinter", minter, authorized, block.timestamp)),
            getMinDelay()
        );
        
        emit MinterAuthorizationScheduled(minter, authorized, block.timestamp + getMinDelay());
    }
    
    /**
     * @notice Programar mudança de desconto de pagamento
     * @param target Contrato alvo
     * @param newDiscount Novo desconto
     */
    function schedulePaymentDiscountChange(
        address target,
        uint256 newDiscount
    ) external onlyRole(PROPOSER_ROLE) {
        bytes memory _data = abi.encodeWithSignature("setPaymentDiscount(uint256)", newDiscount);
        
        this.schedule(
            target,
            0,
            _data,
            bytes32(0),
            keccak256(abi.encodePacked("setPaymentDiscount", newDiscount, block.timestamp)),
            getMinDelay()
        );
        
        emit PaymentDiscountScheduled(newDiscount, block.timestamp + getMinDelay());
    }
    
    /**
     * @notice Programar pausa de emergência (delay reduzido)
     * @param target Contrato alvo
     */
    function scheduleEmergencyPause(
        address target
    ) external onlyRole(PROPOSER_ROLE) {
        bytes memory _data = abi.encodeWithSignature("pause()");
        
        this.schedule(
            target,
            0,
            _data,
            bytes32(0),
            keccak256(abi.encodePacked("emergencyPause", target, block.timestamp)),
            EMERGENCY_MIN_DELAY // Delay reduzido para emergências
        );
        
        emit EmergencyPauseScheduled(target, block.timestamp + EMERGENCY_MIN_DELAY);
    }
    
    // =============================================================
    //                         EVENTOS
    // =============================================================
    
    /**
     * @dev Emitido quando uma operação é programada
     */
    event OperationScheduled(
        string indexed operation,
        address indexed target,
        uint256 value,
        uint256 executeAt
    );
    
    /**
     * @dev Emitido quando autorização de minter é programada
     */
    event MinterAuthorizationScheduled(
        address indexed minter,
        bool authorized,
        uint256 executeAt
    );
    
    /**
     * @dev Emitido quando mudança de desconto é programada
     */
    event PaymentDiscountScheduled(
        uint256 newDiscount,
        uint256 executeAt
    );
    
    /**
     * @dev Emitido quando pausa de emergência é programada
     */
    event EmergencyPauseScheduled(
        address indexed target,
        uint256 executeAt
    );
}
