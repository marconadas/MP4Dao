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
import { IsString, IsArray, IsOptional, IsNumber, IsDateString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkType } from '../enums/work-type.enum';

export class TrackMetadataDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsNumber()
  duration?: number; // em segundos

  @IsOptional()
  @IsNumber()
  trackNumber?: number;

  @IsOptional()
  @IsString()
  isrc?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  lyrics?: string;

  @IsOptional()
  @IsString()
  producer?: string;

  @IsOptional()
  @IsString()
  composer?: string;
}

export class ArtworkMetadataDto {
  @IsString()
  ipfsCid: string;

  @IsString()
  sha256: string;

  @IsString()
  filename: string;

  @IsNumber()
  size: number;

  @IsString()
  mimeType: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;
}

export class AlbumMetadataDto {
  @IsString()
  title: string;

  @IsString()
  artist: string;

  @IsEnum(WorkType)
  workType: WorkType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsOptional()
  @IsString()
  recordLabel?: string;

  @IsOptional()
  @IsString()
  producer?: string;

  @IsOptional()
  @IsString()
  upc?: string; // Universal Product Code

  @IsOptional()
  @IsString()
  catalogNumber?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArtworkMetadataDto)
  artwork?: ArtworkMetadataDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackMetadataDto)
  tracks: TrackMetadataDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  credits?: string[];

  @IsOptional()
  @IsString()
  copyright?: string;

  @IsOptional()
  @IsString()
  publishingRights?: string;

  // Computed fields
  get totalTracks(): number {
    return this.tracks?.length || 0;
  }

  get totalDuration(): number {
    return this.tracks?.reduce((total, track) => total + (track.duration || 0), 0) || 0;
  }

  get hasArtwork(): boolean {
    return !!this.artwork;
  }
}

export class SingleMetadataDto {
  @IsString()
  title: string;

  @IsString()
  artist: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsOptional()
  @IsNumber()
  duration?: number; // em segundos

  @IsOptional()
  @IsString()
  isrc?: string;

  @IsOptional()
  @IsString()
  recordLabel?: string;

  @IsOptional()
  @IsString()
  producer?: string;

  @IsOptional()
  @IsString()
  composer?: string;

  @IsOptional()
  @IsString()
  lyrics?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArtworkMetadataDto)
  artwork?: ArtworkMetadataDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  credits?: string[];

  @IsOptional()
  @IsString()
  copyright?: string;

  @IsOptional()
  @IsString()
  publishingRights?: string;

  get hasArtwork(): boolean {
    return !!this.artwork;
  }
}

// Metadata unificada para diferentes tipos de obras
export class WorkMetadataDto {
  @IsEnum(WorkType)
  workType: WorkType;

  @IsOptional()
  @ValidateNested()
  @Type(() => AlbumMetadataDto)
  album?: AlbumMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SingleMetadataDto)
  single?: SingleMetadataDto;

  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsOptional()
  @IsString()
  animationUrl?: string;

  @IsOptional()
  @IsArray()
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}
