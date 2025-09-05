import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsNumberString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { WorkType } from '../enums/work-type.enum';

export class QueryWorksDto {
  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de itens por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Termo de pesquisa (título, descrição, género)',
    example: 'kizomba',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: WorkType,
    description: 'Filtrar por tipo de obra',
    example: WorkType.MUSIC,
  })
  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @ApiPropertyOptional({
    description: 'Filtrar por género musical',
    example: 'Kizomba',
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    description: 'Filtrar apenas obras públicas',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  publicOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar apenas obras em disputa',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  disputedOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Endereço da carteira do autor',
    example: '0x742d35Cc6634C0532925a3b8D1E2C442d8B8f3bA',
  })
  @IsOptional()
  @IsString()
  authorAddress?: string;

  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    example: 'createdAt',
    enum: ['createdAt', 'title', 'workType', 'registeredAt'],
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'title' | 'workType' | 'registeredAt' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
