/**
 * MP4 DAO - Plataforma de Registo de Copyright Musical em Angola
 * 
 * Copyright (c) 2024 Marcos de Jesus Araújo Cândido dos Santos
 * Rua Luís Simões 55A 2ºEsq, Pendão, Queluz, 2745-035, Lisboa
 * 
 * This file is part of the MP4 DAO project.
 * 
 * Licensed under the MIT License. See LICENSE file for details.
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TokenService } from './token.service';

@ApiTags('Token')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('info')
  @ApiOperation({ summary: 'Obter informações básicas do token MP4' })
  @ApiResponse({ status: 200, description: 'Informações do token obtidas com sucesso' })
  async getTokenInfo() {
    try {
      return await this.tokenService.getTokenInfo();
    } catch (error) {
      throw new HttpException(
        'Erro ao obter informações do token',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('balance/:address')
  @ApiOperation({ summary: 'Obter balance de tokens de um endereço' })
  @ApiResponse({ status: 200, description: 'Balance obtido com sucesso' })
  async getBalance(@Param('address') address: string) {
    try {
      const balance = await this.tokenService.getBalance(address);
      return {
        address,
        balance,
        symbol: 'MP4'
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao obter balance',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('mediator/:address')
  @ApiOperation({ summary: 'Verificar se endereço pode ser mediador' })
  @ApiResponse({ status: 200, description: 'Status de mediador verificado' })
  async getMediatorStatus(@Param('address') address: string) {
    try {
      const [canMediate, stakeInfo] = await Promise.all([
        this.tokenService.canMediate(address),
        this.tokenService.getMediatorStake(address)
      ]);

      return {
        address,
        canMediate,
        stake: stakeInfo
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao verificar status de mediador',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('payment-discount/:baseAmount')
  @ApiOperation({ summary: 'Calcular desconto para pagamento em MP4' })
  @ApiResponse({ status: 200, description: 'Desconto calculado com sucesso' })
  async calculateDiscount(@Param('baseAmount') baseAmount: string) {
    try {
      // Converter para wei se necessário
      const baseAmountWei = baseAmount.includes('.') 
        ? ethers.parseEther(baseAmount).toString()
        : baseAmount;

      return await this.tokenService.calculatePaymentDiscount(baseAmountWei);
    } catch (error) {
      throw new HttpException(
        'Erro ao calcular desconto',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('proposals')
  @ApiOperation({ summary: 'Listar propostas de governança' })
  @ApiResponse({ status: 200, description: 'Propostas obtidas com sucesso' })
  async getProposals(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0'
  ) {
    try {
      const limitNum = Math.min(parseInt(limit) || 10, 50); // Máximo 50
      const offsetNum = parseInt(offset) || 0;

      return await this.tokenService.getProposals(limitNum, offsetNum);
    } catch (error) {
      throw new HttpException(
        'Erro ao obter propostas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('proposals/:id')
  @ApiOperation({ summary: 'Obter proposta específica' })
  @ApiResponse({ status: 200, description: 'Proposta obtida com sucesso' })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  async getProposal(@Param('id') id: string) {
    try {
      const proposalId = parseInt(id);
      if (isNaN(proposalId) || proposalId < 1) {
        throw new HttpException('ID de proposta inválido', HttpStatus.BAD_REQUEST);
      }

      return await this.tokenService.getProposal(proposalId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro ao obter proposta',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('rewards/mediator')
  @ApiOperation({ summary: 'Distribuir recompensa para mediador (Admin apenas)' })
  @ApiResponse({ status: 200, description: 'Recompensa distribuída com sucesso' })
  // @UseGuards(AdminGuard) // Implementar guard de admin
  async distributeMediatorReward(
    @Body() body: {
      mediatorAddress: string;
      amount: string;
      reason?: string;
    }
  ) {
    try {
      const { mediatorAddress, amount, reason } = body;

      if (!mediatorAddress || !amount) {
        throw new HttpException(
          'Endereço do mediador e quantidade são obrigatórios',
          HttpStatus.BAD_REQUEST
        );
      }

      // Usar chave privada do environment (em produção, usar sistema mais seguro)
      const signerKey = process.env.ADMIN_PRIVATE_KEY;
      if (!signerKey) {
        throw new HttpException(
          'Chave de administração não configurada',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const result = await this.tokenService.distributeMediatorReward(
        mediatorAddress,
        amount,
        signerKey
      );

      return {
        ...result,
        reason: reason || 'Recompensa de mediação'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao distribuir recompensa',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('rewards/activity')
  @ApiOperation({ summary: 'Mintar recompensa por atividade (Sistema apenas)' })
  @ApiResponse({ status: 200, description: 'Recompensa mintada com sucesso' })
  async mintActivityReward(
    @Body() body: {
      userAddress: string;
      activityType: string;
      multiplier?: number;
    }
  ) {
    try {
      const { userAddress, activityType, multiplier = 1 } = body;

      if (!userAddress || !activityType) {
        throw new HttpException(
          'Endereço do usuário e tipo de atividade são obrigatórios',
          HttpStatus.BAD_REQUEST
        );
      }

      const amount = this.tokenService.calculateActivityReward(activityType, multiplier);
      
      // Usar chave privada do environment
      const signerKey = process.env.ADMIN_PRIVATE_KEY;
      if (!signerKey) {
        throw new HttpException(
          'Chave de administração não configurada',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const result = await this.tokenService.mintReward(
        userAddress,
        amount,
        signerKey
      );

      return {
        ...result,
        activityType,
        rewardCalculation: {
          baseAmount: multiplier,
          activityMultiplier: amount,
          totalReward: amount
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao mintar recompensa',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('events')
  @ApiOperation({ summary: 'Obter eventos recentes do token' })
  @ApiResponse({ status: 200, description: 'Eventos obtidos com sucesso' })
  async getRecentEvents(
    @Query('fromBlock') fromBlock: string = '-1000',
    @Query('eventTypes') eventTypes: string = ''
  ) {
    try {
      const fromBlockNum = parseInt(fromBlock) || -1000;
      const eventTypesArray = eventTypes ? eventTypes.split(',') : [];

      const events = await this.tokenService.getRecentEvents(fromBlockNum, eventTypesArray);

      return {
        events,
        total: events.length,
        fromBlock: fromBlockNum
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao obter eventos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas do token' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso' })
  async getTokenStats() {
    try {
      const [tokenInfo, proposals] = await Promise.all([
        this.tokenService.getTokenInfo(),
        this.tokenService.getProposals(1, 0) // Apenas para obter o total
      ]);

      return {
        token: tokenInfo,
        governance: {
          totalProposals: proposals.total,
          // Adicionar mais estatísticas conforme necessário
        },
        // Adicionar estatísticas de staking, etc.
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao obter estatísticas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
