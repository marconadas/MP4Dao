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
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkType } from '../enums/work-type.enum';

export class AuthorSplitDto {
  @ApiProperty({
    description: 'Endereço da carteira do autor',
    example: '0x742d35Cc6634C0532925a3b8D1E2C442d8B8f3bA',
  })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'Percentagem de direitos do autor (0-100)',
    example: 50.5,
  })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  percentage: number;
}

export class CreateWorkDto {
  @ApiProperty({
    description: 'Título da obra musical',
    example: 'Minha Nova Música',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada da obra',
    example: 'Uma música sobre a vida em Angola...',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: WorkType,
    description: 'Tipo de obra musical',
    example: WorkType.MUSIC,
  })
  @IsEnum(WorkType)
  workType: WorkType;

  @ApiProperty({
    description: 'Género musical',
    example: 'Kizomba',
    required: false,
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiProperty({
    description: 'Data de criação da obra',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  creationDate?: string;

  @ApiProperty({
    description: 'Código ISWC (International Standard Musical Work Code)',
    example: 'T-123456789-0',
    required: false,
  })
  @IsOptional()
  @IsString()
  iswc?: string;

  @ApiProperty({
    description: 'Código ISRC (International Standard Recording Code)',
    example: 'AO-ABC-24-12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  isrc?: string;

  @ApiProperty({
    description: 'Se a obra deve ser listada publicamente',
    example: true,
  })
  @IsBoolean()
  publicListing: boolean;

  @ApiProperty({
    type: [AuthorSplitDto],
    description: 'Lista de autores e respetivas percentagens',
    example: [
      {
        walletAddress: '0x742d35Cc6634C0532925a3b8D1E2C442d8B8f3bA',
        percentage: 60,
      },
      {
        walletAddress: '0x8ba1f109551bD432803012645Hac136c7c7d8b9',
        percentage: 40,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => AuthorSplitDto)
  authors: AuthorSplitDto[];

  @ApiProperty({
    description: 'Hash SHA-256 da obra (calculado pelo frontend)',
    example: '0x1234567890abcdef...',
    required: false,
  })
  @IsOptional()
  @IsString()
  workHash?: string;

  @ApiProperty({
    description: 'URI dos metadados IPFS',
    example: 'ipfs://QmXxx...',
    required: false,
  })
  @IsOptional()
  @IsString()
  metadataUri?: string;

  @ApiProperty({
    description: 'Hash da transação na blockchain',
    example: '0xabcdef1234567890...',
    required: false,
  })
  @IsOptional()
  @IsString()
  blockchainTxHash?: string;
}
